import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // Prisma: Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
    }

    // Prisma: Create the new user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password,
        ecoPoints: 0
      }
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: 'Server error during registration' }, { status: 500 });
  }
}