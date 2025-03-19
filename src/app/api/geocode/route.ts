import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const address = url.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Store Transitions App'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service error');
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}