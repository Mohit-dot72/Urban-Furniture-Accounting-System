import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, email, mobile, city, state, pincode, address, gstNo } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
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

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
