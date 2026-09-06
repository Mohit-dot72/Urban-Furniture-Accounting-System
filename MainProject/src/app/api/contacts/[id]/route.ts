import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        salesOrders: {
          include: {
            lines: {
              include: { product: true },
            },
          },
          orderBy: { date: "desc" },
        },
        invoices: {
          include: {
            lines: {
              include: { product: true },
            },
            payments: true,
          },
          orderBy: { date: "desc" },
        },
        purchaseOrders: {
          include: {
            lines: {
              include: { product: true },
            },
          },
          orderBy: { date: "desc" },
        },
        bills: {
          include: {
            lines: {
              include: { product: true },
            },
            payments: true,
          },
          orderBy: { date: "desc" },
        },
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Failed to fetch contact profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete contact:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, type, email, mobile, city, state, pincode, address, gstNo } = await req.json();
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name, type,
        email: email || null,
        mobile: mobile || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        address: address || null,
        gstNo: gstNo || null,
      },
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Failed to update contact:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

