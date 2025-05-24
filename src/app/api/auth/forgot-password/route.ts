import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Generate a secure token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Set up email transporter - FIXED TO USE DOMAIN SMTP INSTEAD OF GMAIL
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com', // Your domain's SMTP server
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP_USER,     // raeean@discountsmap.com
    pass: process.env.SMTP_PASS      // Ryandahan7$
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond the same way for security
    if (!user) {
      return NextResponse.json(
        { message: 'If this email exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate and store reset token
    const token = generateToken();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    
    // Update the user with the reset token and expiration
    await prisma.user.update({
      where: { email },
      data: { 
        resetPasswordToken: token,
        resetPasswordExpires: expiration
      },
    });

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email with magic link - NOW SENDS FROM YOUR DOMAIN
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@discountsmap.com', // ✅ Your domain alias
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetLink}</p>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'If this email exists, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}