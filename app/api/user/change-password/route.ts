import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import bcrypt from 'bcrypt'

const passwordStrengthRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"
);

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    // Fetch user from DB
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [session.user.id])
    const user = userResult.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Password cannot be changed for accounts using OAuth' }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    // Validate new password strength
    if (!passwordStrengthRegex.test(newPassword)) {
      return NextResponse.json({
        error: 'New password does not meet strength requirements. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
      }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password in DB
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, session.user.id])

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
