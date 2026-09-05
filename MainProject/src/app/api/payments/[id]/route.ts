import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.payment.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Payment permanently deleted" });
  } catch (error) {
    console.error("Failed to delete payment:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
