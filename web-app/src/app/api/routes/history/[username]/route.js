export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { username } = params;

    // 1. Verify the user exists in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 2. Fetch history using Prisma's sorting
    const history = await prisma.savedRoute.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: 'desc' }
    });

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}