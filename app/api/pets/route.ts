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
      name, species, breed, age, weight_lbs, microchip_id, care_instructions
    } = body

    let newPet;

    if (id) {
      newPet = await pool.query(
        `INSERT INTO pets (
               id, user_id, name, species, breed, age, weight_lbs, microchip_id, care_instructions
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               species = EXCLUDED.species,
               breed = EXCLUDED.breed,
               age = EXCLUDED.age,
               weight_lbs = EXCLUDED.weight_lbs,
               microchip_id = EXCLUDED.microchip_id,
               care_instructions = EXCLUDED.care_instructions
             RETURNING *`,
        [
          id, user.id, name, species, breed, age, weight_lbs, microchip_id, care_instructions
        ]
      )
    } else {
      newPet = await pool.query(
        `INSERT INTO pets (
               user_id, name, species, breed, age, weight_lbs, microchip_id, care_instructions
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
        [
          user.id, name, species, breed, age, weight_lbs, microchip_id, care_instructions
        ]
      )
    }

    return NextResponse.json(newPet.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating/updating pet:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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

      // Verify ownership via household_id (pets link to user_id, user_id links to household)
      const result = await pool.query(
        `DELETE FROM pets
       WHERE id = $1 AND user_id IN (SELECT id FROM users WHERE household_id = $2)
       RETURNING id`,
        [id, user.householdId]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Pet not found or access denied' }, { status: 404 })
      }

      return NextResponse.json({ success: true, id })
    } catch (error) {
      console.error('Error deleting pet:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
