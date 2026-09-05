import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [invoices, bills, payments, budgets, products] = await Promise.all([
      prisma.invoice.findMany({ include: { contact: true } }),
      prisma.bill.findMany({ include: { contact: true } }),
      prisma.payment.findMany({ include: { contact: true } }),
      prisma.budget.findMany(),
      prisma.product.findMany(),
    ]);

    const notifications: any[] = [];
    let idCounter = 1;

    // 1. Overdue / Open Sales Invoices Alert
    invoices.forEach((inv) => {
      if (inv.status !== "Paid") {
        notifications.push({
          id: `notif-${idCounter++}`,
          title: inv.status === "Open" ? "Invoice Payment Pending" : "Partial Invoice Receipt",
          message: `Invoice ${inv.invoiceNo} for ${inv.contact?.name || "Customer"} (₹${inv.total.toLocaleString("en-IN")}) requires payment collection.`,
          details: `Invoice ${inv.invoiceNo} issued on ${new Date(inv.date).toLocaleDateString("en-IN")} has status '${inv.status}'. Outstanding amount: ₹${inv.total.toLocaleString("en-IN")}. Contact ${inv.contact?.email || inv.contact?.name}.`,
          timestamp: "Recently",
          category: "FINANCIAL",
          read: false,
          severity: inv.status === "Open" ? "error" : "warning",
          actionUrl: "/sales",
          actionLabel: "Go to Sales / Invoices",
          referenceCode: inv.invoiceNo,
        });
      }
    });

    // 2. Vendor Bills Alert
    bills.forEach((b) => {
      if (b.status !== "Paid") {
        notifications.push({
          id: `notif-${idCounter++}`,
          title: "Vendor Bill Payment Due",
          message: `Bill ${b.billNo} from ${b.contact?.name || "Vendor"} (₹${b.total.toLocaleString("en-IN")}) is open for disbursement.`,
          details: `Bill ${b.billNo} generated for purchase order has status '${b.status}'. Total amount payable: ₹${b.total.toLocaleString("en-IN")}. Process bank payment disbursement.`,
          timestamp: "Today",
          category: "FINANCIAL",
          read: false,
          severity: "info",
          actionUrl: "/purchases",
          actionLabel: "Pay Vendor Bill",
          referenceCode: b.billNo,
        });
      }
    });

    // 3. Payments Received / Sent
    payments.forEach((p) => {
      notifications.push({
        id: `notif-${idCounter++}`,
        title: p.type === "Receive" ? "Payment Received" : "Payment Disbursed",
        message: `${p.type === "Receive" ? "Received" : "Disbursed"} ₹${p.amount.toLocaleString("en-IN")} ${p.type === "Receive" ? "from" : "to"} ${p.contact?.name || "Contact"} via ${p.mode}.`,
        details: `Payment reference ${p.paymentNo} for amount ₹${p.amount.toLocaleString("en-IN")} recorded under mode ${p.mode} (Ref: ${p.reference || "N/A"}).`,
        timestamp: new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        category: "FINANCIAL",
        read: true,
        severity: "success",
        actionUrl: "/payments",
        actionLabel: "View Payment",
        referenceCode: p.paymentNo,
      });
    });

    // 4. Budget Alerts
    budgets.forEach((bdg) => {
      notifications.push({
        id: `notif-${idCounter++}`,
        title: `Budget Target Active: ${bdg.name}`,
        message: `Quarterly budget limit of ₹${bdg.plannedAmount.toLocaleString("en-IN")} set for ${bdg.accountName}.`,
        details: `Planned budget target for ${bdg.name} runs from ${new Date(bdg.startDate).toLocaleDateString("en-IN")} to ${new Date(bdg.endDate).toLocaleDateString("en-IN")}. Total planned: ₹${bdg.plannedAmount.toLocaleString("en-IN")}.`,
        timestamp: "Active",
        category: "BUDGET",
        read: true,
        severity: "warning",
        actionUrl: "/budgets",
        actionLabel: "Check Budget Analytics",
        referenceCode: bdg.name.split(" ")[0],
      });
    });

    // 5. System Log Notification
    notifications.push({
      id: `notif-${idCounter++}`,
      title: "System Audit Log",
      message: "Database successfully connected to PostgreSQL with active seed records.",
      details: "Audit logging active. System connected via Prisma ORM to PostgreSQL server.",
      timestamp: "Just now",
      category: "SYSTEM",
      read: true,
      severity: "info",
      actionUrl: "/settings",
      actionLabel: "Security Settings",
      referenceCode: "SYS-OK",
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to generate notifications:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
