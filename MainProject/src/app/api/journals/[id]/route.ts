import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.journal.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete journal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, type } = await req.json();
    const journal = await prisma.journal.update({
      where: { id },
      data: { name, type },
    });
    return NextResponse.json(journal);
  } catch (error) {
    console.error("Failed to update journal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
