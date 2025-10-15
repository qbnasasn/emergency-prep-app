import { NextResponse } from 'next/server';
import { getUserLocations } from '@/lib/locations';

export async function GET() {
  try {
    const locations = await getUserLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
