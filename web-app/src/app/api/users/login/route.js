import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Prisma: Find a unique user by their username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check password (Note: In a real app, use bcrypt to hash and compare!)
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, error: 'Server error during login' }, { status: 500 });
  }
}