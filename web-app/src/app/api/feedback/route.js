import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/mongodb';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, name, email, phone, rating, text } = await request.json();
    
    await mongoose.connection.collection('feedbacks').insertOne({
      username: username || 'Anonymous',
      name: name || '',
      email: email || '',
      phone: phone || '',
      rating,
      text,
      submittedAt: new Date()
    });

    return NextResponse.json({ success: true, message: 'Feedback saved successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save feedback' }, { status: 500 });
  }
}