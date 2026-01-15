import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: 'Cette route n\'est pas implémentée' },
    { status: 404 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Cette route n\'est pas implémentée' },
    { status: 404 }
  );
}
