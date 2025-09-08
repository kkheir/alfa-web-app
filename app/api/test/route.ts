import {NextRequest, NextResponse} from 'next/server';

export async function GET() {
    return NextResponse.json({message: 'Test endpoint working'});
}

export async function POST(request: NextRequest) {
    return NextResponse.json({message: 'POST endpoint working'});
}
