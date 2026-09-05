import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, category, code } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: { name, type, category: category || null, code: code || null },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Failed to create account:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
