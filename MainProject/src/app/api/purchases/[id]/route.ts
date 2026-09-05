import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.purchaseOrder.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Purchase order permanently deleted" });
  } catch (error) {
    console.error("Failed to delete purchase order:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
