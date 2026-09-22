import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import SavedRoute from '../../../../../models/SavedRoute';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { username } = params;

    const user = await User.findOne({ username });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const history = await SavedRoute.find({ userId: user._id }).sort({ savedAt: -1 });
    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}