import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  try {
    const body = await request.json()
    const { first_name, last_name, weight_lbs, height_inches, birth_date, role, phone_number, email, call_sign } = body

    const updatedMember = await db.query(
      `UPDATE family_members
       SET first_name = $1, last_name = $2, weight_lbs = $3, height_inches = $4, birth_date = $5, role = $6, phone_number = $7, email = $8, call_sign = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [first_name, last_name, weight_lbs, height_inches, birth_date, role, phone_number, email, call_sign, id, session.user.id]
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
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  try {
    const result = await db.query('DELETE FROM family_members WHERE id = $1 AND user_id = $2', [id, session.user.id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Family member not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Family member deleted successfully' })
  } catch (error) {
    console.error(`Error deleting family member ${id}:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
