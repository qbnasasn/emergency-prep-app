import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';
import { Resend } from 'resend';

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { householdId } = user;
  if (!householdId) {
    return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    try {
      // 1. Fetch Recipients (Family Members with emails)
      const recipientsRes = await client.query(
        `SELECT fm.email, fm.first_name
         FROM family_members fm
         JOIN users u ON fm.user_id = u.id
         WHERE u.household_id = $1
         AND fm.email IS NOT NULL AND fm.email != ''`,
        [householdId]
      );

      const recipients = recipientsRes.rows.map(row => row.email);

      // Also include the current user's email if not already covered (optional but good practice)
      // Check if user has email in users table
      const userRes = await client.query('SELECT email FROM users WHERE id = $1', [user.id]);
      if (userRes.rows.length > 0 && userRes.rows[0].email) {
          if (!recipients.includes(userRes.rows[0].email)) {
              recipients.push(userRes.rows[0].email);
          }
      }

      if (recipients.length === 0) {
        return NextResponse.json({ message: 'No recipients found to broadcast to.' }, { status: 200 });
      }

      // 2. Fetch Active Plans
      const plansRes = await client.query(
        `SELECT p.id, p.name, p.description, p.hazard_type
         FROM plans p
         JOIN users u ON p.user_id = u.id
         WHERE u.household_id = $1 AND p.is_active = true`,
        [householdId]
      );

      const activePlans = plansRes.rows;

      if (activePlans.length === 0) {
        return NextResponse.json({ message: 'No active plans found to broadcast.' }, { status: 200 });
      }

      // 3. Construct Email Content
      let emailBody = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f; text-align: center;">🚨 EMERGENCY BROADCAST ACTIVATED 🚨</h1>
          <p style="text-align: center; font-size: 1.1em;">The emergency mode has been activated for your household. Please review the following active plans immediately.</p>
          <hr style="border-color: #eee; margin: 20px 0;" />
      `;

      for (const plan of activePlans) {
        // Fetch Locations
        const locRes = await client.query(
          `SELECT name, description, street_number, street_name, city, state, zip_code
           FROM plan_locations
           WHERE plan_id = $1`,
          [plan.id]
        );
        const locations = locRes.rows;

        // Fetch Key Contacts (Linked Family Members in Plan)
        const contactsRes = await client.query(
          `SELECT fm.first_name, fm.last_name, fm.phone_number, fm.role
           FROM plan_contacts pc
           JOIN family_members fm ON pc.family_member_id = fm.id
           WHERE pc.plan_id = $1`,
          [plan.id]
        );
        const contacts = contactsRes.rows;

        emailBody += `
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #d32f2f;">
            <h2 style="margin-top: 0; color: #d32f2f;">${plan.name} <span style="font-size: 0.8em; font-weight: normal; color: #666;">(${plan.hazard_type})</span></h2>
            <p><strong>Description:</strong> ${plan.description || 'No description provided.'}</p>

            <h3 style="margin-bottom: 10px;">📍 Meeting Places</h3>
        `;

        if (locations.length > 0) {
          emailBody += `<ul>`;
          for (const loc of locations) {
            const address = [
                loc.street_number,
                loc.street_name,
                loc.city,
                loc.state,
                loc.zip_code
            ].filter(Boolean).join(' ');

            emailBody += `
              <li>
                <strong>${loc.name}</strong>
                ${address ? `<br/><span style="color: #555; font-size: 0.9em;">${address}</span>` : ''}
                ${loc.description ? `<br/><span style="color: #555; font-style: italic; font-size: 0.9em;">${loc.description}</span>` : ''}
              </li>
            `;
          }
          emailBody += `</ul>`;
        } else {
          emailBody += `<p style="color: #666; font-style: italic;">No meeting places designated.</p>`;
        }

        emailBody += `<h3 style="margin-bottom: 10px;">📞 Key Contacts</h3>`;

        if (contacts.length > 0) {
          emailBody += `<ul>`;
          for (const contact of contacts) {
            emailBody += `
              <li>
                <strong>${contact.first_name} ${contact.last_name}</strong> (${contact.role})
                ${contact.phone_number ? `<br/><a href="tel:${contact.phone_number}" style="color: #0066cc;">${contact.phone_number}</a>` : ''}
              </li>
            `;
          }
          emailBody += `</ul>`;
        } else {
           emailBody += `<p style="color: #666; font-style: italic;">No key contacts listed.</p>`;
        }

        emailBody += `</div>`;
      }

      emailBody += `
          <hr style="border-color: #eee; margin: 20px 0;" />
          <p style="text-align: center; font-size: 0.9em; color: #666;">
            Stay safe and follow your plan.
            <br />
            <a href="https://prepsafe.app/dashboard" style="color: #0066cc;">View Dashboard</a>
          </p>
        </div>
      `;

      // 4. Send Emails via Resend
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Skipping broadcast email.');
        return NextResponse.json({ message: 'Broadcast simulated (API key missing)' }, { status: 200 });
      }

      const resend = new Resend(apiKey);

      // Send individually to ensure delivery privacy or use bcc?
      // Individual is safer for avoiding 'reply-all' storms and privacy.
      // But Resend rate limits might be an issue? "Email every family member".
      // Given the small scale (household), loop is fine.

      const emailPromises = recipients.map(email =>
        resend.emails.send({
          from: 'alerts@prepsafe.app',
          to: email,
          subject: '🚨 EMERGENCY BROADCAST: Action Required',
          html: emailBody,
        })
      );

      await Promise.all(emailPromises);

      return NextResponse.json({ success: true, count: recipients.length }, { status: 200 });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in emergency broadcast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
