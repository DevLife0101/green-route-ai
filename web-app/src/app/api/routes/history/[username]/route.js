export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(req, { params }) {
  try {
    const { username } = params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        routes: {
          orderBy: { savedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, history: user.routes });
  } catch (error) {
    console.error("History Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}