import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, type, category, code } = await req.json();
    const account = await prisma.account.update({
      where: { id },
      data: { name, type, category: category || null, code: code || null },
    });
    return NextResponse.json(account);
  } catch (error) {
    console.error("Failed to update account:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
