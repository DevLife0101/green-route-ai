import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET() {
  try {
    await dbConnect();
    const topUsers = await User.find({}, 'username ecoPoints').sort({ ecoPoints: -1 }).limit(10);
    return NextResponse.json({ success: true, leaderboard: topUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}