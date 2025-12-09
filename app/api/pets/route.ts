import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { householdId } = user;

  try {
    // Fetch all pets linked to users in the same household
    const pets = await pool.query(
        `SELECT p.*
         FROM pets p
         JOIN users u ON p.user_id = u.id
         WHERE u.household_id = $1
         ORDER BY p.created_at ASC`,
        [householdId]
    )
    return NextResponse.json(pets.rows)
  } catch (error) {
    console.error('Error fetching pets:', error)
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
      name, species, breed, age, weight_lbs, microchip_id, care_instructions
    } = body

    const newPet = await pool.query(
      `INSERT INTO pets (
         user_id, name, species, breed, age, weight_lbs, microchip_id, care_instructions
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user.id, name, species, breed, age, weight_lbs, microchip_id, care_instructions
      ]
    )

    return NextResponse.json(newPet.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
