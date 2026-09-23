export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { username, startCoords, endCoords, distanceKm } = await req.json();

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // 2. Calculate points (e.g., 10 points per km)
    const pointsEarned = Math.round(distanceKm * 10); 

    // 3. Create the route in PostgreSQL
    await prisma.savedRoute.create({
      data: {
        userId: user.id,
        startCoords,
        endCoords,
        distanceKm,
        pointsEarned
      }
    });

    // 4. Update the user's total points
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { ecoPoints: { increment: pointsEarned } }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Eco Route saved!', 
      totalPoints: updatedUser.ecoPoints 
    });
  } catch (error) {
    console.error("Save Route Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}