import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const householdId = user.householdId;
  if (!householdId) {
    return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
  }

  try {
    // Fetch all family members linked to users in the same household
    const familyMembers = await db.query(
      `SELECT fm.*
         FROM family_members fm
         JOIN users u ON fm.user_id = u.id
         WHERE u.household_id = $1
         ORDER BY fm.created_at ASC`,
      [householdId]
    )
    return NextResponse.json(familyMembers.rows)
  } catch (error) {
    console.error('Error fetching family members:', error)
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      id,
      first_name, last_name, weight_lbs, height_inches, birth_date, role,
      phone_number, email, call_sign, street_number, street_name, city, state, zip_code
    } = body

    let newMember;

    if (id) {
      // UPSERT
      newMember = await db.query(
        `INSERT INTO family_members (
               id, user_id, first_name, last_name, weight_lbs, height_inches, birth_date, role,
               phone_number, email, call_sign, street_number, street_name, city, state, zip_code
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO UPDATE SET
               first_name = EXCLUDED.first_name,
               last_name = EXCLUDED.last_name,
               weight_lbs = EXCLUDED.weight_lbs,
               height_inches = EXCLUDED.height_inches,
               birth_date = EXCLUDED.birth_date,
               role = EXCLUDED.role,
               phone_number = EXCLUDED.phone_number,
               email = EXCLUDED.email,
               call_sign = EXCLUDED.call_sign,
               street_number = EXCLUDED.street_number,
               street_name = EXCLUDED.street_name,
               city = EXCLUDED.city,
               state = EXCLUDED.state,
               zip_code = EXCLUDED.zip_code
             RETURNING *`,
        [
          id, user.id, first_name, last_name, weight_lbs, height_inches, birth_date, role,
          phone_number, email, call_sign, street_number, street_name, city, state, zip_code
        ]
      )
    } else {
      // CREATE (Old behavior)
      newMember = await db.query(
        `INSERT INTO family_members (
               user_id, first_name, last_name, weight_lbs, height_inches, birth_date, role,
               phone_number, email, call_sign, street_number, street_name, city, state, zip_code
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             RETURNING *`,
        [
          user.id, first_name, last_name, weight_lbs, height_inches, birth_date, role,
          phone_number, email, call_sign, street_number, street_name, city, state, zip_code
        ]
      )
    }

    return NextResponse.json(newMember.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating/updating family member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Verify ownership via household_id
    const result = await db.query(
      `DELETE FROM family_members
       WHERE id = $1 AND user_id IN (SELECT id FROM users WHERE household_id = $2)
       RETURNING id`,
      [id, user.householdId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Family member not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting family member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
