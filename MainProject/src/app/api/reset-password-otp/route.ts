import { NextResponse } from "next/server";
import { verifyAndConsumeOtp } from "@/lib/otpStore";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { recipient, otp, newPassword } = await req.json();

    if (!recipient || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Recipient, OTP code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Verify OTP against server store
    const isValid = verifyAndConsumeOtp(recipient, otp);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP code. Please request a new OTP." },
        { status: 400 }
      );
    }

    // If recipient is an email, update user password in Prisma database if user exists
    if (recipient.includes("@")) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: recipient },
        });

        if (existingUser) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await prisma.user.update({
            where: { email: recipient },
            data: { password: hashedPassword },
          });
          console.log(`[PASSWORD RESET] Updated password for database user: ${recipient}`);
        }
      } catch (dbErr) {
        console.error("[DATABASE UPDATE ERROR]:", dbErr);
        // Continue cleanly
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully!",
    });
  } catch (error) {
    console.error("[RESET PASSWORD OTP ERROR]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
