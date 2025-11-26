import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await resend.emails.send({
      from: 'alerts@prepsafe.app',
      to: session.user.email,
      subject: 'PrepSafe Test Notification',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>This is a Test!</h1>
          <p>If you are seeing this, your PrepSafe email notifications are working correctly.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            <a href="https://prepsafe.app/dashboard/settings">Manage Settings</a>
          </p>
        </div>
      `
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
