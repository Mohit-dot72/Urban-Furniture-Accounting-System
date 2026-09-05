import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
