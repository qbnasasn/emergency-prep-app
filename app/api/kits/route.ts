import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth"
import { getKits } from '@/lib/data/kits';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const kits = await getKits(userId);
    return NextResponse.json(kits);
  } catch (error) {
    console.error('Error fetching kits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}