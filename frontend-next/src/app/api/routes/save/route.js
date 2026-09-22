import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import SavedRoute from '../../../../models/SavedRoute';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, startCoords, endCoords, distanceKm } = await request.json();
    
    const user = await User.findOne({ username });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const pointsEarned = Math.max(1, Math.floor(distanceKm * 10));

    const newRoute = new SavedRoute({
      userId: user._id,
      startCoords,
      endCoords,
      distanceKm,
      pointsEarned
    });
    await newRoute.save();

    user.ecoPoints += pointsEarned;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: `Route saved! You earned ${pointsEarned} Eco Points.`, 
      totalPoints: user.ecoPoints 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}