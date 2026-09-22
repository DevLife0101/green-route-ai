import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();
    const user = await User.findOne({ username });
    
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
    }
    
    return NextResponse.json({ success: true, message: "Login successful!", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}