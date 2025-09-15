import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  try {
    const body = await request.json()
    const {
      name, species, breed, age, weight_lbs, microchip_id, care_instructions
    } = body

    const updatedPet = await pool.query(
      `UPDATE pets
       SET
         name = $1, species = $2, breed = $3, age = $4, weight_lbs = $5,
         microchip_id = $6, care_instructions = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        name, species, breed, age, weight_lbs, microchip_id, care_instructions,
        id, session.user.id
      ]
    )

    if (updatedPet.rows.length === 0) {
      return NextResponse.json({ error: 'Pet not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json(updatedPet.rows[0])
  } catch (error) {
    console.error(`Error updating pet ${id}:`, error)
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
    const result = await pool.query('DELETE FROM pets WHERE id = $1 AND user_id = $2', [id, session.user.id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Pet not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Pet deleted successfully' })
  } catch (error) {
    console.error(`Error deleting pet ${id}:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
