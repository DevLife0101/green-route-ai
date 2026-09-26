export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { username, routeId } = await req.json();

    if (!username || !routeId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 2. Find the specific route to see how many points it was worth
    const routeToDelete = await prisma.savedRoute.findUnique({
      where: { id: routeId }
    });

    if (!routeToDelete || routeToDelete.userId !== user.id) {
      return NextResponse.json({ success: false, message: "Route not found or unauthorized" }, { status: 404 });
    }

    // 3. Delete the route from the database
    await prisma.savedRoute.delete({
      where: { id: routeId }
    });

    // 4. Deduct the points they originally earned (ensure it doesn't drop below 0)
    const newTotal = Math.max(0, user.ecoPoints - routeToDelete.pointsEarned);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { ecoPoints: newTotal }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Route deleted successfully",
      totalPoints: newTotal 
    }, { status: 200 });

  } catch (error) {
    console.error("Delete Route Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}