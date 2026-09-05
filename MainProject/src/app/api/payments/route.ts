import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        contact: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      paymentNo: p.paymentNo,
      type: p.type.toUpperCase().includes("RECEIVE") ? "RECEIVE" : "SEND",
      contact: p.contact?.name || "Unknown Party",
      date: new Date(p.date).toISOString().split("T")[0],
      amount: p.amount,
      mode: p.mode,
      reference: p.reference || "",
      status: p.status || (p.type.toUpperCase().includes("RECEIVE") ? "Received" : "Sent"),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/payments error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments from PostgreSQL" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, contact, date, amount, mode, reference } = body;

    if (!contact || !amount || !mode) {
      return NextResponse.json(
        { error: "Contact, amount, and mode are required" },
        { status: 400 }
      );
    }

    // Find contact by name or create a new contact in PostgreSQL database
    let contactRecord = await prisma.contact.findFirst({
      where: { name: { equals: contact, mode: "insensitive" } },
    });

    if (!contactRecord) {
      contactRecord = await prisma.contact.create({
        data: {
          name: contact,
          type: type === "RECEIVE" ? "CUSTOMER" : "VENDOR",
          status: "Active",
        },
      });
    }

    const count = await prisma.payment.count();
    const paymentNo = `PAY/2025/${String(count + 1).padStart(3, "0")}`;

    const created = await prisma.payment.create({
      data: {
        paymentNo,
        type: type === "RECEIVE" ? "Receive" : "Send",
        contactId: contactRecord.id,
        date: date ? new Date(date) : new Date(),
        amount: Number(amount),
        mode,
        reference: reference || null,
        status: type === "RECEIVE" ? "Received" : "Sent",
      },
      include: {
        contact: true,
      },
    });

    return NextResponse.json({
      id: created.id,
      paymentNo: created.paymentNo,
      type: created.type.toUpperCase().includes("RECEIVE") ? "RECEIVE" : "SEND",
      contact: created.contact?.name || contact,
      date: new Date(created.date).toISOString().split("T")[0],
      amount: created.amount,
      mode: created.mode,
      reference: created.reference || "",
      status: created.status,
    });
  } catch (error) {
    console.error("[POST /api/payments error]:", error);
    return NextResponse.json(
      { error: "Failed to create payment in PostgreSQL" },
      { status: 500 }
    );
  }
}
