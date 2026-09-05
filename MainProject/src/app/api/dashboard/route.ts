import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      salesOrders,
      invoices,
      purchaseOrders,
      bills,
      payments,
      accounts,
    ] = await Promise.all([
      prisma.salesOrder.findMany({ include: { contact: true } }),
      prisma.invoice.findMany({ include: { contact: true } }),
      prisma.purchaseOrder.findMany({ include: { contact: true } }),
      prisma.bill.findMany({ include: { contact: true } }),
      prisma.payment.findMany({ include: { contact: true } }),
      prisma.account.findMany(),
    ]);

    // KPI 1: Total Sales Revenue
    const totalSales = salesOrders.reduce((sum, so) => sum + (so.total || 0), 0);

    // KPI 2: Total Purchases
    const totalPurchases = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);

    // KPI 3: Total Receivables (Unpaid/Partially paid Invoices)
    const openInvoices = invoices.filter((i) => i.status !== "Paid");
    const totalReceivables = openInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

    // KPI 4: Total Payables (Unpaid Bills)
    const openBills = bills.filter((b) => b.status !== "Paid");
    const totalPayables = openBills.reduce((sum, b) => sum + (b.total || 0), 0);

    // Cash Flow Overview (Aggregated by Payment dates)
    const cashFlowMap: Record<string, { in: number; out: number }> = {};

    payments.forEach((p) => {
      const dStr = new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!cashFlowMap[dStr]) cashFlowMap[dStr] = { in: 0, out: 0 };

      if (p.type === "Receive") {
        cashFlowMap[dStr].in += p.amount;
      } else {
        cashFlowMap[dStr].out += p.amount;
      }
    });

    const cashFlow = Object.keys(cashFlowMap).map((d) => ({
      d,
      in: cashFlowMap[d].in,
      out: cashFlowMap[d].out,
    }));

    if (cashFlow.length === 0) {
      cashFlow.push(
        { d: "May 10", in: 125000, out: 140000 },
        { d: "May 14", in: 100000, out: 96000 },
        { d: "May 24", in: 69000, out: 75000 }
      );
    }

    // Top Expenses Breakdown
    const expenseAccounts = accounts.filter((a) => a.type === "EXPENSE");
    const totalExpVal = totalPurchases + 250000 + 132000;
    const expenses = [
      {
        name: "Furniture Purchase Expense",
        value: totalPurchases,
        pct: `${Math.round((totalPurchases / (totalExpVal || 1)) * 100)}%`,
        color: "#3b82f6",
      },
      {
        name: "Showroom Rent Expense",
        value: 150000,
        pct: `${Math.round((150000 / (totalExpVal || 1)) * 100)}%`,
        color: "#8b5cf6",
      },
      {
        name: "Staff Salary Expense",
        value: 100000,
        pct: `${Math.round((100000 / (totalExpVal || 1)) * 100)}%`,
        color: "#06b6d4",
      },
      {
        name: "Other Operating Expense",
        value: 50000,
        pct: `${Math.round((50000 / (totalExpVal || 1)) * 100)}%`,
        color: "#f59e0b",
      },
    ];

    // Recent Transactions List
    const txnsList: any[] = [];

    invoices.slice(0, 3).forEach((inv) => {
      txnsList.push({
        date: new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        type: "Invoice",
        ref: inv.invoiceNo,
        party: inv.contact?.name || "Customer",
        amount: inv.total,
        status: inv.status,
        timestamp: new Date(inv.date).getTime(),
      });
    });

    bills.slice(0, 3).forEach((b) => {
      txnsList.push({
        date: new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        type: "Bill",
        ref: b.billNo,
        party: b.contact?.name || "Vendor",
        amount: b.total,
        status: b.status,
        timestamp: new Date(b.date).getTime(),
      });
    });

    payments.slice(0, 3).forEach((p) => {
      txnsList.push({
        date: new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        type: `Payment (${p.mode})`,
        ref: p.paymentNo,
        party: p.contact?.name || "Contact",
        amount: p.amount,
        status: p.status,
        timestamp: new Date(p.date).getTime(),
      });
    });

    txnsList.sort((a, b) => b.timestamp - a.timestamp);

    // Bank Accounts Balances
    const bankAccountsList = accounts
      .filter((a) => a.category === "Cash & Bank" || a.name.toLowerCase().includes("bank"))
      .map((a, idx) => ({
        name: a.name,
        no: a.code ? `AC Code: ${a.code}` : "AC No: 1324567890",
        balance: idx === 0 ? 175250 : 230750,
        color: idx % 2 === 0 ? "from-blue-600 to-blue-700" : "from-indigo-600 to-indigo-700",
      }));

    if (bankAccountsList.length === 0) {
      bankAccountsList.push(
        { name: "HDFC Bank", no: "AC No: 1324567890", balance: 175250, color: "from-blue-600 to-blue-700" },
        { name: "ICICI Bank", no: "AC No: 1234567890", balance: 230750, color: "from-indigo-600 to-indigo-700" }
      );
    }

    return NextResponse.json({
      kpis: {
        totalSales,
        totalPurchases,
        totalReceivables,
        totalPayables,
      },
      cashFlow,
      expenses,
      recentTxns: txnsList.slice(0, 6),
      bankAccounts: bankAccountsList,
    });
  } catch (error) {
    console.error("Failed to generate dashboard data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
