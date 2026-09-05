import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, type, category, salesPrice, purchasePrice } = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name, type, category,
        salesPrice: Number(salesPrice) || 0,
        purchasePrice: Number(purchasePrice) || 0,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
