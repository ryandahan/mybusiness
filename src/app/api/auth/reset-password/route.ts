import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    // Validate inputs
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      return NextResponse.json(
        { message: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return NextResponse.json(
        { message: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}