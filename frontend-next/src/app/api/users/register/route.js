import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, email, password } = await request.json();
    const newUser = new User({ username, email, password });
    await newUser.save();
    return NextResponse.json({ success: true, message: "User created!", user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}