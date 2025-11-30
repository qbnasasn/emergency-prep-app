import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  try {
    const body = await request.json()
    const {
      first_name, last_name, weight_lbs, height_inches, birth_date, role,
      phone_number, email, call_sign, street_number, street_name, city, state, zip_code
    } = body

    const updatedMember = await db.query(
      `UPDATE family_members
       SET
         first_name = $1, last_name = $2, weight_lbs = $3, height_inches = $4,
         birth_date = $5, role = $6, phone_number = $7, email = $8, call_sign = $9,
         street_number = $10, street_name = $11, city = $12, state = $13, zip_code = $14
       WHERE id = $15 AND user_id = $16
       RETURNING *`,
      [
        first_name, last_name, weight_lbs, height_inches, birth_date, role,
        phone_number, email, call_sign, street_number, street_name, city, state, zip_code,
        id, user.id
      ]
    )

    if (updatedMember.rows.length === 0) {
      return NextResponse.json({ error: 'Family member not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json(updatedMember.rows[0])
  } catch (error) {
    console.error(`Error updating family member ${id}:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  try {
    const result = await db.query('DELETE FROM family_members WHERE id = $1 AND user_id = $2', [id, user.id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Family member not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Family member deleted successfully' })
  } catch (error) {
    console.error(`Error deleting family member ${id}:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
