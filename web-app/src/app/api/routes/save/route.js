export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { username, startCoords, endCoords, distanceKm } = await request.json();

    // 1. Find user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const pointsEarned = Math.max(1, Math.floor(distanceKm * 10));

    // 2. Save route to PostgreSQL
    await prisma.savedRoute.create({
      data: {
        userId: user.id,
        startCoords,
        endCoords,
        distanceKm: parseFloat(distanceKm),
        pointsEarned
      }
    });

    // 3. Increment user's ecoPoints
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ecoPoints: {
          increment: pointsEarned
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Route saved! You earned ${pointsEarned} Eco Points.`,
      totalPoints: updatedUser.ecoPoints
    }, { status: 200 });

  } catch (error) {
    console.error("Save Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}