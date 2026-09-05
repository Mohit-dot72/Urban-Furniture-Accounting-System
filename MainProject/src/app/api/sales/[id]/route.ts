import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.salesOrder.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Sales order permanently deleted" });
  } catch (error) {
    console.error("Failed to delete sales order:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
