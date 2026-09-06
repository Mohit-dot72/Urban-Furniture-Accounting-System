import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        contact: true,
        bills: {
          include: {
            payments: true,
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = orders.map((po) => {
      const bill = po.bills[0];
      const pymt = bill?.payments[0];

      return {
        id: po.id,
        orderNo: po.orderNo,
        vendorName: po.contact?.name || "Vendor",
        date: new Date(po.date).toISOString().split("T")[0],
        status: po.status,
        total: po.total,
        bill: bill
          ? {
              billNo: bill.billNo,
              date: new Date(bill.date).toISOString().split("T")[0],
              dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : null,
              status: bill.status,
              total: bill.total,
            }
          : null,
        payment: pymt
          ? {
              paymentNo: pymt.paymentNo,
              date: new Date(pymt.date).toISOString().split("T")[0],
              mode: pymt.mode,
              amount: pymt.amount,
              status: pymt.status,
            }
          : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/purchases error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vendorName, date, total, status, description } = body;

    if (!vendorName || !total) {
      return NextResponse.json(
        { error: "Vendor name and purchase total are required" },
        { status: 400 }
      );
    }

    // Find contact by name or create a new vendor contact
    let contact = await prisma.contact.findFirst({
      where: { name: { equals: vendorName, mode: "insensitive" } },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: vendorName,
          type: "VENDOR",
          status: "Active",
        },
      });
    }

    const count = await prisma.purchaseOrder.count();
    const orderNo = `PO/2025/${String(count + 38).padStart(3, "0")}`;
    const billCount = await prisma.bill.count();
    const billNo = `BILL/2025/${String(billCount + 60).padStart(3, "0")}`;

    const orderDate = date ? new Date(date) : new Date();
    const dueDate = new Date(orderDate);
    dueDate.setDate(dueDate.getDate() + 14);

    // Create Purchase Order & Vendor Bill
    const createdPO = await prisma.purchaseOrder.create({
      data: {
        orderNo,
        contactId: contact.id,
        date: orderDate,
        status: status || "Confirmed",
        total: Number(total),
        bills: {
          create: [
            {
              billNo,
              contactId: contact.id,
              date: orderDate,
              dueDate,
              status: "Open",
              total: Number(total),
            },
          ],
        },
      },
      include: {
        contact: true,
        bills: true,
      },
    });

    const bill = createdPO.bills[0];

    return NextResponse.json({
      id: createdPO.id,
      orderNo: createdPO.orderNo,
      vendorName: createdPO.contact.name,
      date: new Date(createdPO.date).toISOString().split("T")[0],
      status: createdPO.status,
      total: createdPO.total,
      bill: {
        billNo: bill.billNo,
        date: new Date(bill.date).toISOString().split("T")[0],
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : null,
        status: bill.status,
        total: bill.total,
      },
      payment: null,
    });
  } catch (error) {
    console.error("[POST /api/purchases error]:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
