import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const familyMembers = await db.query('SELECT * FROM family_members WHERE user_id = $1 ORDER BY created_at ASC', [session.user.id])
    return NextResponse.json(familyMembers.rows)
  } catch (error) {
    console.error('Error fetching family members:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
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
        session.user.id, first_name, last_name, weight_lbs, height_inches, birth_date, role,
        phone_number, email, call_sign, street_number, street_name, city, state, zip_code
      ]
    )

    return NextResponse.json(newMember.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating family member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
