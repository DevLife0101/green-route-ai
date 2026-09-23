export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const leaderboard = await prisma.user.findMany({
      orderBy: { ecoPoints: 'desc' },
      take: 100,
      select: { username: true, ecoPoints: true }
    });
    
    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}