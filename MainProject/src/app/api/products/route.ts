import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, category, salesPrice, purchasePrice } = await req.json();

    if (!name || !type || !category) {
      return NextResponse.json({ message: "Name, type, and category are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name, type, category,
        salesPrice: Number(salesPrice) || 0,
        purchasePrice: Number(purchasePrice) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
