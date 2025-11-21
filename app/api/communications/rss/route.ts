import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return NextResponse.json({ error: 'Failed to parse RSS feed' }, { status: 500 });
  }
}
