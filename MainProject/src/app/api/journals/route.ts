import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(journals);
  } catch (error) {
    console.error("Failed to fetch journals:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
    }

    const journal = await prisma.journal.create({
      data: { name, type },
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error("Failed to create journal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
