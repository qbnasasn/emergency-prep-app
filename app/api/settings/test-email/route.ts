import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { sendNotification } from '@/lib/notifications';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sendNotification(
      session.user.id,
      'Test Notification',
      'This is a test email from PrepSafe.',
      'system'
    );
    return NextResponse.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
