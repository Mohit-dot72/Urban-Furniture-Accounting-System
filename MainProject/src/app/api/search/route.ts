import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const navItems = [
  { title: "Dashboard", url: "/", category: "Navigation" },
  { title: "Notifications", url: "/notifications", category: "Navigation" },
  { title: "Contacts", url: "/contacts", category: "Navigation" },
  { title: "Products", url: "/products", category: "Navigation" },
  { title: "Chart of Accounts", url: "/accounts", category: "Navigation" },
  { title: "Journals", url: "/journals", category: "Navigation" },
  { title: "Journal Entries", url: "/transactions", category: "Navigation" },
  { title: "Purchases", url: "/purchases", category: "Navigation" },
  { title: "Sales", url: "/sales", category: "Navigation" },
  { title: "Payments", url: "/payments", category: "Navigation" },
  { title: "Budgets", url: "/budgets", category: "Navigation" },
  { title: "Reports", url: "/reports", category: "Navigation" },
  { title: "Settings", url: "/settings", category: "Navigation" },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({
        navigation: navItems.slice(0, 5),
        contacts: [],
        products: [],
        sales: [],
        purchases: [],
        payments: [],
        journalEntries: [],
      });
    }

    // 1. Filter Navigation items
    const matchedNav = navItems.filter((item) =>
      item.title.toLowerCase().includes(q.toLowerCase())
    );

    // 2. Parallel PostgreSQL queries
    const [
      contacts,
      products,
      salesOrders,
      invoices,
      purchaseOrders,
      bills,
      payments,
      journalEntries,
    ] = await Promise.all([
      prisma.contact.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),
      prisma.salesOrder.findMany({
        where: {
          OR: [
            { orderNo: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: true },
        take: 3,
      }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNo: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: true },
        take: 3,
      }),
      prisma.purchaseOrder.findMany({
        where: {
          OR: [
            { orderNo: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: true },
        take: 3,
      }),
      prisma.bill.findMany({
        where: {
          OR: [
            { billNo: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: true },
        take: 3,
      }),
      prisma.payment.findMany({
        where: {
          OR: [
            { paymentNo: { contains: q, mode: "insensitive" } },
            { reference: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: true },
        take: 4,
      }),
      prisma.journalEntry.findMany({
        where: {
          OR: [
            { entryNo: { contains: q, mode: "insensitive" } },
            { reference: { contains: q, mode: "insensitive" } },
            { narration: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { journal: true },
        take: 4,
      }),
    ]);

    // Format sales & purchases into unified structures
    const salesList = [
      ...salesOrders.map((so) => ({
        id: so.id,
        title: `Sales Order ${so.orderNo}`,
        subtitle: `Customer: ${so.contact?.name || "N/A"} • Amount: ₹${so.total.toLocaleString("en-IN")}`,
        url: "/sales",
        badge: "SO",
      })),
      ...invoices.map((inv) => ({
        id: inv.id,
        title: `Invoice ${inv.invoiceNo}`,
        subtitle: `Customer: ${inv.contact?.name || "N/A"} • Amount: ₹${inv.total.toLocaleString("en-IN")}`,
        url: "/sales",
        badge: "INV",
      })),
    ];

    const purchasesList = [
      ...purchaseOrders.map((po) => ({
        id: po.id,
        title: `Purchase Order ${po.orderNo}`,
        subtitle: `Vendor: ${po.contact?.name || "N/A"} • Amount: ₹${po.total.toLocaleString("en-IN")}`,
        url: "/purchases",
        badge: "PO",
      })),
      ...bills.map((b) => ({
        id: b.id,
        title: `Vendor Bill ${b.billNo}`,
        subtitle: `Vendor: ${b.contact?.name || "N/A"} • Amount: ₹${b.total.toLocaleString("en-IN")}`,
        url: "/purchases",
        badge: "BILL",
      })),
    ];

    return NextResponse.json({
      navigation: matchedNav,
      contacts: contacts.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.type} • ${c.email || c.mobile || c.city || "Contact"}`,
        url: "/contacts",
        badge: c.type,
      })),
      products: products.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `${p.category} • Sales: ₹${p.salesPrice.toLocaleString("en-IN")}`,
        url: "/products",
        badge: p.type,
      })),
      sales: salesList,
      purchases: purchasesList,
      payments: payments.map((p) => ({
        id: p.id,
        title: `Payment ${p.paymentNo}`,
        subtitle: `${p.type === "RECEIVE" ? "From" : "To"}: ${p.contact?.name || "Contact"} • ₹${p.amount.toLocaleString("en-IN")} (${p.mode})`,
        url: "/payments",
        badge: p.type,
      })),
      journalEntries: journalEntries.map((je) => ({
        id: je.id,
        title: `Journal Entry ${je.entryNo}`,
        subtitle: `${je.journal?.name || "Journal"} • Total: ₹${je.totalDebit.toLocaleString("en-IN")}`,
        url: "/transactions",
        badge: "JE",
      })),
    });
  } catch (error) {
    console.error("Global search API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
