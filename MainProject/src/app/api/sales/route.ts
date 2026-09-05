import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        contact: true,
        invoices: {
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

    const formatted = orders.map((so) => {
      const inv = so.invoices[0];
      const pymt = inv?.payments[0];

      return {
        id: so.id,
        orderNo: so.orderNo,
        customerName: so.contact?.name || "Customer",
        date: new Date(so.date).toISOString().split("T")[0],
        status: so.status,
        total: so.total,
        invoice: inv
          ? {
              invoiceNo: inv.invoiceNo,
              date: new Date(inv.date).toISOString().split("T")[0],
              dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : null,
              status: inv.status,
              total: inv.total,
            }
          : null,
        receipt: pymt
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
    console.error("[GET /api/sales error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales orders from PostgreSQL" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, date, total, status, description } = body;

    if (!customerName || !total) {
      return NextResponse.json(
        { error: "Customer name and order total are required" },
        { status: 400 }
      );
    }

    // Find contact by name or create a new customer contact in PostgreSQL
    let contact = await prisma.contact.findFirst({
      where: { name: { equals: customerName, mode: "insensitive" } },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: customerName,
          type: "CUSTOMER",
          status: "Active",
        },
      });
    }

    const count = await prisma.salesOrder.count();
    const orderNo = `SO/2025/${String(count + 24).padStart(3, "0")}`;
    const invCount = await prisma.invoice.count();
    const invoiceNo = `INV/2025/${String(invCount + 81).padStart(3, "0")}`;

    const orderDate = date ? new Date(date) : new Date();
    const dueDate = new Date(orderDate);
    dueDate.setDate(dueDate.getDate() + 14);

    // Create Sales Order in PostgreSQL
    const createdSO = await prisma.salesOrder.create({
      data: {
        orderNo,
        contactId: contact.id,
        date: orderDate,
        status: status || "Confirmed",
        total: Number(total),
        invoices: {
          create: [
            {
              invoiceNo,
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
        invoices: true,
      },
    });

    const inv = createdSO.invoices[0];

    return NextResponse.json({
      id: createdSO.id,
      orderNo: createdSO.orderNo,
      customerName: createdSO.contact.name,
      date: new Date(createdSO.date).toISOString().split("T")[0],
      status: createdSO.status,
      total: createdSO.total,
      invoice: {
        invoiceNo: inv.invoiceNo,
        date: new Date(inv.date).toISOString().split("T")[0],
        dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : null,
        status: inv.status,
        total: inv.total,
      },
      receipt: null,
    });
  } catch (error) {
    console.error("[POST /api/sales error]:", error);
    return NextResponse.json(
      { error: "Failed to create sales order in PostgreSQL" },
      { status: 500 }
    );
  }
}
