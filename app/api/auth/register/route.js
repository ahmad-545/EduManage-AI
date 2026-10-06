import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'teacher',
      status: 'active', // Auto-activated for seamless demo login
      baseSalary: 50000,
    });

    return NextResponse.json(
      {
        message: 'Registration successful! Your account is activated and ready for login.',
        teacherId: newTeacher._id,
        email: normalizedEmail,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: 'Failed to process teacher registration: ' + err.message },
      { status: 500 }
    );
  }
}
