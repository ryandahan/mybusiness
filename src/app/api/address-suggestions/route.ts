import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Use Nominatim for OpenStreetMap geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'StoreTransitions/1.0', // Replace with your app name
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Nominatim API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Address suggestion error:', error);
    return NextResponse.json({ error: 'Failed to fetch address suggestions' }, { status: 500 });
  }
}