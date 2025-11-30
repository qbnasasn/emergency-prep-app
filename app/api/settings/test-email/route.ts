import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sendNotification(
      user.id,
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
