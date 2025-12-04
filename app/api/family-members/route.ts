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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
      first_name, last_name, weight_lbs, height_inches, birth_date, role,
      phone_number, email, call_sign, street_number, street_name, city, state, zip_code
    } = body

    const newMember = await db.query(
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

    return NextResponse.json(newMember.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating family member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
