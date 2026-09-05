import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Clearing old data and starting comprehensive database seeding...");

  // Clean existing tables in reverse dependency order
  await prisma.journalLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.billLine.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.contact.deleteMany();

  // 1. Users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@urbanfurniture.com" },
    update: {},
    create: {
      email: "admin@urbanfurniture.com",
      password: hashedPassword,
      firstName: "Mohit",
      lastName: "Kumar",
      role: "ADMIN",
    },
  });
  console.log(`👤 Admin ready: ${adminUser.email}`);

  // 2. 10 People / Contacts
  const contactsData = [
    {
      name: "Nakash Pathak",
      type: "CUSTOMER" as const,
      email: "nakash.pathak@urbanfurnishings.in",
      mobile: "+91 98765 43210",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      address: "102 Horizon Towers, BKC, Bandra East",
      gstNo: "27AAAAA0000A1Z5",
      status: "Active",
    },
    {
      name: "Azure Furniture Ltd",
      type: "VENDOR" as const,
      email: "contact@azurefurniture.com",
      mobile: "+91 98123 45678",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      address: "45 Industrial Layout, Peenya Industrial Area",
      gstNo: "29BBBCA1234B1Z2",
      status: "Active",
    },
    {
      name: "Priya Sharma",
      type: "CUSTOMER" as const,
      email: "priya.sharma@designstudio.in",
      mobile: "+91 97111 22334",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      address: "B-14 Connaught Place, Inner Circle",
      gstNo: "07CCCCA5678C1Z9",
      status: "Active",
    },
    {
      name: "Rajesh Kumar Timber Co.",
      type: "VENDOR" as const,
      email: "rajesh.timber@lumberhouse.com",
      mobile: "+91 98450 11223",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      address: "88 Timber Yard, Guindy Industrial Estate",
      gstNo: "33DDDDM9012D1Z4",
      status: "Active",
    },
    {
      name: "Anita Roy Interiors",
      type: "BOTH" as const,
      email: "anita.roy@homedecor.co.in",
      mobile: "+91 99321 88776",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700001",
      address: "12 Park Street, 3rd Floor",
      gstNo: "19EEEER3456E1Z1",
      status: "Active",
    },
    {
      name: "Vikramaditya Mehta",
      type: "CUSTOMER" as const,
      email: "vikram.mehta@apexspaces.com",
      mobile: "+91 98200 99887",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      address: "701 Synergy Tower, SG Highway",
      gstNo: "24FFFFV7890F1Z8",
      status: "Active",
    },
    {
      name: "Siddharth Verma",
      type: "CUSTOMER" as const,
      email: "siddharth.v@modernliving.org",
      mobile: "+91 98990 77665",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      address: "Plot 42 Hi-Tech City, Madhapur",
      gstNo: "36GGGGV2345G1Z3",
      status: "Active",
    },
    {
      name: "Kavita Reddy Crafts",
      type: "VENDOR" as const,
      email: "kavita@craftwoodsupplies.com",
      mobile: "+91 97400 33445",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      address: "55 Crafts Lane, Koregaon Park",
      gstNo: "27HHHHK6789H1Z6",
      status: "Active",
    },
    {
      name: "Rohan Kapoor Decor",
      type: "BOTH" as const,
      email: "rohan.kapoor@luxuryspaces.in",
      mobile: "+91 99800 55443",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      address: "10 C-Scheme, Ashok Nagar",
      gstNo: "08IIIIK1234I1Z0",
      status: "Active",
    },
    {
      name: "Meera Singhania",
      type: "CUSTOMER" as const,
      email: "meera.singhania@heritageinteriors.com",
      mobile: "+91 98711 44332",
      city: "Chandigarh",
      state: "Punjab",
      pincode: "160017",
      address: "Sector 17-C, Commercial Complex",
      gstNo: "03JJJJS5678J1Z7",
      status: "Active",
    },
  ];

  const contactsMap: Record<string, any> = {};
  for (const cData of contactsData) {
    const created = await prisma.contact.create({ data: cData });
    contactsMap[created.name] = created;
  }
  console.log(`✅ 10 People/Contacts created.`);

  // 3. Products
  const productsData = [
    { name: "Executive Teak Desk", type: "Goods", category: "Office Desks", salesPrice: 45000, purchasePrice: 28000 },
    { name: "Ergonomic Mesh Chair", type: "Goods", category: "Seating", salesPrice: 18500, purchasePrice: 11000 },
    { name: "Solid Oak Conference Table", type: "Goods", category: "Conference", salesPrice: 95000, purchasePrice: 62000 },
    { name: "Premium Leather Sofa 3-Seater", type: "Goods", category: "Lounge", salesPrice: 78000, purchasePrice: 48000 },
    { name: "Modular Office Workstation", type: "Goods", category: "Workstations", salesPrice: 32000, purchasePrice: 20000 },
    { name: "Metal Archival Cabinet", type: "Goods", category: "Storage", salesPrice: 22000, purchasePrice: 13500 },
    { name: "Marble Top Reception Counter", type: "Goods", category: "Reception", salesPrice: 115000, purchasePrice: 75000 },
    { name: "Acoustic Fabric Partition Screen", type: "Goods", category: "Partitions", salesPrice: 12500, purchasePrice: 7500 },
    { name: "Custom Interior Fitting Service", type: "Service", category: "Services", salesPrice: 25000, purchasePrice: 10000 },
    { name: "Furniture Restoration Service", type: "Service", category: "Services", salesPrice: 15000, purchasePrice: 6000 },
  ];

  const productsMap: Record<string, any> = {};
  for (const pData of productsData) {
    const created = await prisma.product.create({ data: pData });
    productsMap[created.name] = created;
  }
  console.log(`✅ 10 Urban Furniture Products created.`);

  // 4. Chart of Accounts
  const accountsData = [
    { code: "1010", name: "Cash in Hand", type: "ASSET" as const, category: "Cash & Bank" },
    { code: "1020", name: "HDFC Bank Account", type: "ASSET" as const, category: "Cash & Bank" },
    { code: "1030", name: "ICICI Bank Account", type: "ASSET" as const, category: "Cash & Bank" },
    { code: "1200", name: "Accounts Receivable", type: "ASSET" as const, category: "Current Assets" },
    { code: "1300", name: "Furniture Inventory", type: "ASSET" as const, category: "Stock Assets" },
    { code: "2010", name: "Accounts Payable", type: "LIABILITY" as const, category: "Current Liabilities" },
    { code: "2200", name: "GST Payable", type: "LIABILITY" as const, category: "Tax Liabilities" },
    { code: "3010", name: "Capital Account", type: "EQUITY" as const, category: "Equity" },
    { code: "4010", name: "Sales Revenue", type: "REVENUE" as const, category: "Operating Revenue" },
    { code: "4020", name: "Restoration & Service Income", type: "REVENUE" as const, category: "Other Revenue" },
    { code: "5010", name: "Furniture Purchase Expense", type: "EXPENSE" as const, category: "Cost of Goods Sold" },
    { code: "5020", name: "Showroom Rent Expense", type: "EXPENSE" as const, category: "Operating Expense" },
    { code: "5030", name: "Staff Salary Expense", type: "EXPENSE" as const, category: "Operating Expense" },
    { code: "5040", name: "Logistics & Freight Expense", type: "EXPENSE" as const, category: "Operating Expense" },
  ];

  const accountsMap: Record<string, any> = {};
  for (const aData of accountsData) {
    const created = await prisma.account.create({ data: aData });
    accountsMap[created.name] = created;
  }
  console.log(`✅ Chart of Accounts populated.`);

  // 5. Journals Master
  const journalsData = [
    { name: "Customer Sales Journal", type: "SALES" as const },
    { name: "Vendor Purchase Journal", type: "PURCHASE" as const },
    { name: "HDFC Bank Journal", type: "BANK" as const },
    { name: "Main Cash Journal", type: "CASH" as const },
    { name: "General Miscellaneous Journal", type: "GENERAL" as const },
  ];

  const journalsMap: Record<string, any> = {};
  for (const jData of journalsData) {
    const created = await prisma.journal.create({ data: jData });
    journalsMap[created.type] = created;
  }
  console.log(`✅ Master Journals created.`);

  // 6. Sales Orders, Invoices & Receipts for Customers
  // Nakash Pathak (Customer)
  const so1 = await prisma.salesOrder.create({
    data: {
      orderNo: "SO/2025/019",
      contactId: contactsMap["Nakash Pathak"].id,
      date: new Date("2025-05-10"),
      status: "Confirmed",
      total: 125000,
      lines: {
        create: [
          { productId: productsMap["Executive Teak Desk"].id, qty: 2, price: 45000, amount: 90000 },
          { productId: productsMap["Ergonomic Mesh Chair"].id, qty: 2, price: 17500, amount: 35000 },
        ],
      },
    },
  });

  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNo: "INV/2025/076",
      contactId: contactsMap["Nakash Pathak"].id,
      salesOrderId: so1.id,
      date: new Date("2025-05-12"),
      dueDate: new Date("2025-05-26"),
      status: "Paid",
      total: 125000,
      lines: {
        create: [
          { productId: productsMap["Executive Teak Desk"].id, description: "Executive Teak Desk - Teak Wood Finish", qty: 2, price: 45000, amount: 90000 },
          { productId: productsMap["Ergonomic Mesh Chair"].id, description: "Ergonomic Mesh Chair with High Back", qty: 2, price: 17500, amount: 35000 },
        ],
      },
    },
  });

  const rcpt1 = await prisma.payment.create({
    data: {
      paymentNo: "RCPT/2025/033",
      type: "Receive",
      contactId: contactsMap["Nakash Pathak"].id,
      invoiceId: inv1.id,
      date: new Date("2025-05-14"),
      amount: 125000,
      mode: "Bank",
      reference: "HDFC-TXN-998822",
      status: "Received",
    },
  });

  // Priya Sharma (Customer)
  const so2 = await prisma.salesOrder.create({
    data: {
      orderNo: "SO/2025/020",
      contactId: contactsMap["Priya Sharma"].id,
      date: new Date("2025-05-15"),
      status: "Confirmed",
      total: 173000,
      lines: {
        create: [
          { productId: productsMap["Solid Oak Conference Table"].id, qty: 1, price: 95000, amount: 95000 },
          { productId: productsMap["Premium Leather Sofa 3-Seater"].id, qty: 1, price: 78000, amount: 78000 },
        ],
      },
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNo: "INV/2025/077",
      contactId: contactsMap["Priya Sharma"].id,
      salesOrderId: so2.id,
      date: new Date("2025-05-16"),
      dueDate: new Date("2025-05-30"),
      status: "Open",
      total: 173000,
      lines: {
        create: [
          { productId: productsMap["Solid Oak Conference Table"].id, description: "Solid Oak Table (8-seater)", qty: 1, price: 95000, amount: 95000 },
          { productId: productsMap["Premium Leather Sofa 3-Seater"].id, description: "Italian Leather 3-Seater Sofa", qty: 1, price: 78000, amount: 78000 },
        ],
      },
    },
  });

  // Vikramaditya Mehta (Customer)
  const so3 = await prisma.salesOrder.create({
    data: {
      orderNo: "SO/2025/021",
      contactId: contactsMap["Vikramaditya Mehta"].id,
      date: new Date("2025-05-18"),
      status: "Confirmed",
      total: 211000,
      lines: {
        create: [
          { productId: productsMap["Marble Top Reception Counter"].id, qty: 1, price: 115000, amount: 115000 },
          { productId: productsMap["Modular Office Workstation"].id, qty: 3, price: 32000, amount: 96000 },
        ],
      },
    },
  });

  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNo: "INV/2025/078",
      contactId: contactsMap["Vikramaditya Mehta"].id,
      salesOrderId: so3.id,
      date: new Date("2025-05-20"),
      dueDate: new Date("2025-06-03"),
      status: "Partially Paid",
      total: 211000,
      lines: {
        create: [
          { productId: productsMap["Marble Top Reception Counter"].id, description: "Custom Marble Counter", qty: 1, price: 115000, amount: 115000 },
          { productId: productsMap["Modular Office Workstation"].id, description: "4-Person Modular Pods", qty: 3, price: 32000, amount: 96000 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNo: "RCPT/2025/034",
      type: "Receive",
      contactId: contactsMap["Vikramaditya Mehta"].id,
      invoiceId: inv3.id,
      date: new Date("2025-05-22"),
      amount: 100000,
      mode: "UPI",
      reference: "UPI-REF-771122",
      status: "Received",
    },
  });

  // Siddharth Verma (Customer)
  const so4 = await prisma.salesOrder.create({
    data: {
      orderNo: "SO/2025/022",
      contactId: contactsMap["Siddharth Verma"].id,
      date: new Date("2025-05-22"),
      status: "Confirmed",
      total: 69000,
      lines: {
        create: [
          { productId: productsMap["Metal Archival Cabinet"].id, qty: 2, price: 22000, amount: 44000 },
          { productId: productsMap["Custom Interior Fitting Service"].id, qty: 1, price: 25000, amount: 25000 },
        ],
      },
    },
  });

  const inv4 = await prisma.invoice.create({
    data: {
      invoiceNo: "INV/2025/079",
      contactId: contactsMap["Siddharth Verma"].id,
      salesOrderId: so4.id,
      date: new Date("2025-05-23"),
      dueDate: new Date("2025-06-06"),
      status: "Paid",
      total: 69000,
      lines: {
        create: [
          { productId: productsMap["Metal Archival Cabinet"].id, description: "Heavy Duty Metal Storage", qty: 2, price: 22000, amount: 44000 },
          { productId: productsMap["Custom Interior Fitting Service"].id, description: "Office Layout Installation", qty: 1, price: 25000, amount: 25000 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNo: "RCPT/2025/035",
      type: "Receive",
      contactId: contactsMap["Siddharth Verma"].id,
      invoiceId: inv4.id,
      date: new Date("2025-05-24"),
      amount: 69000,
      mode: "Bank",
      reference: "ICICI-IMPS-887711",
      status: "Received",
    },
  });

  // Meera Singhania (Customer)
  const so5 = await prisma.salesOrder.create({
    data: {
      orderNo: "SO/2025/023",
      contactId: contactsMap["Meera Singhania"].id,
      date: new Date("2025-05-25"),
      status: "Confirmed",
      total: 92000,
      lines: {
        create: [
          { productId: productsMap["Ergonomic Mesh Chair"].id, qty: 4, price: 18500, amount: 74000 },
          { productId: productsMap["Furniture Restoration Service"].id, qty: 1, price: 18000, amount: 18000 },
        ],
      },
    },
  });

  const inv5 = await prisma.invoice.create({
    data: {
      invoiceNo: "INV/2025/080",
      contactId: contactsMap["Meera Singhania"].id,
      salesOrderId: so5.id,
      date: new Date("2025-05-26"),
      dueDate: new Date("2025-06-09"),
      status: "Open",
      total: 92000,
      lines: {
        create: [
          { productId: productsMap["Ergonomic Mesh Chair"].id, description: "Mesh Chairs Black", qty: 4, price: 18500, amount: 74000 },
          { productId: productsMap["Furniture Restoration Service"].id, description: "Restoration of Antique Conference Desk", qty: 1, price: 18000, amount: 18000 },
        ],
      },
    },
  });

  console.log(`✅ Sales Orders, Customer Invoices & Receipts created for 5 Customer People.`);

  // 7. Purchase Orders, Vendor Bills & Payments for Vendors
  // Azure Furniture Ltd (Vendor)
  const po1 = await prisma.purchaseOrder.create({
    data: {
      orderNo: "PO/2025/033",
      contactId: contactsMap["Azure Furniture Ltd"].id,
      date: new Date("2025-05-02"),
      status: "Confirmed",
      total: 140000,
      lines: {
        create: [
          { productId: productsMap["Modular Office Workstation"].id, qty: 7, price: 20000, amount: 140000 },
        ],
      },
    },
  });

  const bill1 = await prisma.bill.create({
    data: {
      billNo: "BILL/2025/055",
      contactId: contactsMap["Azure Furniture Ltd"].id,
      purchaseOrderId: po1.id,
      date: new Date("2025-05-04"),
      dueDate: new Date("2025-05-18"),
      status: "Paid",
      total: 140000,
      lines: {
        create: [
          { productId: productsMap["Modular Office Workstation"].id, description: "Bulk Workstation Components", qty: 7, price: 20000, amount: 140000 },
        ],
      },
    },
  });

  const pymt1 = await prisma.payment.create({
    data: {
      paymentNo: "PY/2025/011",
      type: "Send",
      contactId: contactsMap["Azure Furniture Ltd"].id,
      billId: bill1.id,
      date: new Date("2025-05-08"),
      amount: 140000,
      mode: "Bank",
      reference: "HDFC-NEFT-33211",
      status: "Sent",
    },
  });

  // Rajesh Kumar Timber Co. (Vendor)
  const po2 = await prisma.purchaseOrder.create({
    data: {
      orderNo: "PO/2025/034",
      contactId: contactsMap["Rajesh Kumar Timber Co."].id,
      date: new Date("2025-05-06"),
      status: "Confirmed",
      total: 124000,
      lines: {
        create: [
          { productId: productsMap["Solid Oak Conference Table"].id, qty: 2, price: 62000, amount: 124000 },
        ],
      },
    },
  });

  const bill2 = await prisma.bill.create({
    data: {
      billNo: "BILL/2025/056",
      contactId: contactsMap["Rajesh Kumar Timber Co."].id,
      purchaseOrderId: po2.id,
      date: new Date("2025-05-07"),
      dueDate: new Date("2025-05-21"),
      status: "Open",
      total: 124000,
      lines: {
        create: [
          { productId: productsMap["Solid Oak Conference Table"].id, description: "Seasoned Oak Wood Slabs", qty: 2, price: 62000, amount: 124000 },
        ],
      },
    },
  });

  // Kavita Reddy Crafts (Vendor)
  const po3 = await prisma.purchaseOrder.create({
    data: {
      orderNo: "PO/2025/035",
      contactId: contactsMap["Kavita Reddy Crafts"].id,
      date: new Date("2025-05-12"),
      status: "Confirmed",
      total: 96000,
      lines: {
        create: [
          { productId: productsMap["Premium Leather Sofa 3-Seater"].id, qty: 2, price: 48000, amount: 96000 },
        ],
      },
    },
  });

  const bill3 = await prisma.bill.create({
    data: {
      billNo: "BILL/2025/057",
      contactId: contactsMap["Kavita Reddy Crafts"].id,
      purchaseOrderId: po3.id,
      date: new Date("2025-05-14"),
      dueDate: new Date("2025-05-28"),
      status: "Paid",
      total: 96000,
      lines: {
        create: [
          { productId: productsMap["Premium Leather Sofa 3-Seater"].id, description: "Italian Leather Framing", qty: 2, price: 48000, amount: 96000 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNo: "PY/2025/012",
      type: "Send",
      contactId: contactsMap["Kavita Reddy Crafts"].id,
      billId: bill3.id,
      date: new Date("2025-05-16"),
      amount: 96000,
      mode: "Bank",
      reference: "HDFC-RTGS-554422",
      status: "Sent",
    },
  });

  // Anita Roy Interiors (Both - Purchase Flow)
  const po4 = await prisma.purchaseOrder.create({
    data: {
      orderNo: "PO/2025/036",
      contactId: contactsMap["Anita Roy Interiors"].id,
      date: new Date("2025-05-18"),
      status: "Confirmed",
      total: 67500,
      lines: {
        create: [
          { productId: productsMap["Metal Archival Cabinet"].id, qty: 5, price: 13500, amount: 67500 },
        ],
      },
    },
  });

  const bill4 = await prisma.bill.create({
    data: {
      billNo: "BILL/2025/058",
      contactId: contactsMap["Anita Roy Interiors"].id,
      purchaseOrderId: po4.id,
      date: new Date("2025-05-19"),
      dueDate: new Date("2025-06-02"),
      status: "Open",
      total: 67500,
      lines: {
        create: [
          { productId: productsMap["Metal Archival Cabinet"].id, description: "Metal Storage Frame Supply", qty: 5, price: 13500, amount: 67500 },
        ],
      },
    },
  });

  // Rohan Kapoor Decor (Both - Purchase Flow)
  const po5 = await prisma.purchaseOrder.create({
    data: {
      orderNo: "PO/2025/037",
      contactId: contactsMap["Rohan Kapoor Decor"].id,
      date: new Date("2025-05-21"),
      status: "Confirmed",
      total: 75000,
      lines: {
        create: [
          { productId: productsMap["Marble Top Reception Counter"].id, qty: 1, price: 75000, amount: 75000 },
        ],
      },
    },
  });

  const bill5 = await prisma.bill.create({
    data: {
      billNo: "BILL/2025/059",
      contactId: contactsMap["Rohan Kapoor Decor"].id,
      purchaseOrderId: po5.id,
      date: new Date("2025-05-22"),
      dueDate: new Date("2025-06-05"),
      status: "Paid",
      total: 75000,
      lines: {
        create: [
          { productId: productsMap["Marble Top Reception Counter"].id, description: "Raw Marble Counter Assembly", qty: 1, price: 75000, amount: 75000 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNo: "PY/2025/013",
      type: "Send",
      contactId: contactsMap["Rohan Kapoor Decor"].id,
      billId: bill5.id,
      date: new Date("2025-05-24"),
      amount: 75000,
      mode: "UPI",
      reference: "UPI-PAY-889900",
      status: "Sent",
    },
  });

  console.log(`✅ Purchase Orders, Vendor Bills & Payments created for 5 Vendor People.`);

  // 8. Balanced Double-Entry Journal Entries
  // Sales Journal Entry
  await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2025/001",
      journalId: journalsMap["SALES"].id,
      date: new Date("2025-05-12"),
      reference: "INV/2025/076",
      narration: "Record furniture sales invoice to Nakash Pathak",
      totalDebit: 125000,
      totalCredit: 125000,
      lines: {
        create: [
          { accountId: accountsMap["Accounts Receivable"].id, description: "Nakash Pathak - Receivable", debit: 125000, credit: 0 },
          { accountId: accountsMap["Sales Revenue"].id, description: "Sales of Teak Desk & Mesh Chairs", debit: 0, credit: 125000 },
        ],
      },
    },
  });

  // Receipt Journal Entry
  await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2025/002",
      journalId: journalsMap["BANK"].id,
      date: new Date("2025-05-14"),
      reference: "RCPT/2025/033",
      narration: "Bank receipt from Nakash Pathak via HDFC Bank",
      totalDebit: 125000,
      totalCredit: 125000,
      lines: {
        create: [
          { accountId: accountsMap["HDFC Bank Account"].id, description: "HDFC Deposit", debit: 125000, credit: 0 },
          { accountId: accountsMap["Accounts Receivable"].id, description: "Nakash Pathak - Settlement", debit: 0, credit: 125000 },
        ],
      },
    },
  });

  // Purchase Journal Entry
  await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2025/003",
      journalId: journalsMap["PURCHASE"].id,
      date: new Date("2025-05-04"),
      reference: "BILL/2025/055",
      narration: "Record vendor bill from Azure Furniture Ltd",
      totalDebit: 140000,
      totalCredit: 140000,
      lines: {
        create: [
          { accountId: accountsMap["Furniture Purchase Expense"].id, description: "Workstation stock purchase", debit: 140000, credit: 0 },
          { accountId: accountsMap["Accounts Payable"].id, description: "Azure Furniture Ltd - Payable", debit: 0, credit: 140000 },
        ],
      },
    },
  });

  // Payment Disbursement Journal Entry
  await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2025/004",
      journalId: journalsMap["BANK"].id,
      date: new Date("2025-05-08"),
      reference: "PY/2025/011",
      narration: "Bank payment disbursement to Azure Furniture Ltd",
      totalDebit: 140000,
      totalCredit: 140000,
      lines: {
        create: [
          { accountId: accountsMap["Accounts Payable"].id, description: "Azure Furniture Ltd - Settlement", debit: 140000, credit: 0 },
          { accountId: accountsMap["HDFC Bank Account"].id, description: "HDFC Withdrawal", debit: 0, credit: 140000 },
        ],
      },
    },
  });

  // General Journal Entry (Rent & Salaries)
  await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2025/005",
      journalId: journalsMap["GENERAL"].id,
      date: new Date("2025-05-30"),
      reference: "EXP/2025/MAY",
      narration: "Monthly Showroom Rent & Staff Salaries Posting",
      totalDebit: 250000,
      totalCredit: 250000,
      lines: {
        create: [
          { accountId: accountsMap["Showroom Rent Expense"].id, description: "May 2025 Showroom Rent", debit: 150000, credit: 0 },
          { accountId: accountsMap["Staff Salary Expense"].id, description: "May 2025 Staff Payroll", debit: 100000, credit: 0 },
          { accountId: accountsMap["ICICI Bank Account"].id, description: "Bank Transfer Disbursement", debit: 0, credit: 250000 },
        ],
      },
    },
  });

  console.log(`✅ Balanced Double-Entry Journal Entries posted to General Ledger.`);

  // 9. Budgets
  await prisma.budget.createMany({
    data: [
      {
        name: "Q2 Sales Revenue Budget",
        accountName: "Sales Revenue",
        analyticAccount: "Main Showroom",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        plannedAmount: 1500000,
      },
      {
        name: "Q2 Furniture Procurement Budget",
        accountName: "Furniture Purchase Expense",
        analyticAccount: "Raw Timber & Parts",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        plannedAmount: 900000,
      },
      {
        name: "Q2 Operating Expenses Budget",
        accountName: "Showroom Rent Expense",
        analyticAccount: "Facilities",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        plannedAmount: 450000,
      },
    ],
  });

  console.log(`✅ Financial Budgets created.`);
  console.log("🎉 Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
