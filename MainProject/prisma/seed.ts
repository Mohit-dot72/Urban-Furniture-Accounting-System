import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Lists for generating 100 realistic people / contacts
const firstNames = [
  "Rohan", "Siddharth", "Ananya", "Vikram", "Kavya", "Harish", "Sunita", "Aditya", "Bhavna", "Chirag",
  "Divya", "Eshan", "Farhan", "Gautam", "Heena", "Ishan", "Jyoti", "Karan", "Latika", "Manish",
  "Neha", "Omkar", "Pooja", "Rahul", "Sneha", "Tarun", "Urvashi", "Varun", "Yash", "Zoya",
  "Arjun", "Deepika", "Nikhil", "Ritu", "Sanjay", "Meera", "Deepak", "Swati", "Alok", "Tanvi",
  "Piyush", "Rashi", "Vivek", "Preeti", "Kunal", "Rashmi", "Abhinav", "Nidhi", "Suresh", "Vandana"
];

const lastNames = [
  "Mehta", "Verma", "Deshmukh", "Singh", "Iyer", "Patel", "Nair", "Joshi", "Mittal", "Saxena",
  "Agarwal", "Kapoor", "Reddy", "Banerjee", "Malhotra", "Kulkarni", "Sharma", "Roy", "Gupta", "Shah",
  "Rao", "Choudhury", "Chatterji", "Bhosale", "Bhat", "Pillai", "Menon", "Ahuja", "Bansal", "Khanna"
];

const vendorCompanies = [
  "Teakwood Crafts & Lumber Co.",
  "Deccan Hardware & Brassware Ltd",
  "Royal Polish & Varnish Works",
  "Apex Woodworking Machinery India",
  "Maharani Silk & Velvet Upholstery",
  "Karnataka Ply & Veneer Industries",
  "Vanguard Metal & Glass Fittings",
  "Southern Sawmills & Timber Yard",
  "Galaxy Mirror & Toughened Glass",
  "Imperial Steel Hinges & Castors",
  "Craftsman Furniture Hardware Ltd",
  "Swastik Wood Finishes & Lacquer",
  "Heritage Cane & Rattan Exports",
  "Orient Fasteners & Screw Corp",
  "Blue Hills Foam & Cushioning",
  "Horizon Freight & Express Logistics",
  "Paragon Timber Importers",
  "Evergreen Plantation Woods",
  "Signature Brass Handles & Fixtures",
  "Crystal Edge Glass Solutions",
  "Metro Sawmill & Wood Processing",
  "Veneer Kraft International",
  "Prime Plywood & Board Mill",
  "Precision Steel Drawer Slides",
  "Elite Fabric & Cushion Suppliers",
  "Golden Oak Timber Logistics",
  "Shree Ram Sawmill & Wood Works",
  "National Glue & Adhesives Corp",
  "Superfine Sandpaper & Abrasives",
  "Global Freight Carriers India",
  "Supreme Packaging & Crating",
  "Luxe Marble & Granite Tops",
  "Maharaja Carving Tools & Blades",
  "Zenith Upholstery Leather Co.",
  "Vibrant Coatings & Paints Ltd",
  "Crown Brassware & Knobs",
  "Standard Wood Screws & Bolts",
  "Pacific Freight Services",
  "Balaji Timber Yard & Depot",
  "Reliance Plywood Industries"
];

const locations = [
  { city: "Mumbai", state: "Maharashtra", code: "27", pincode: "400001", address: "BKC Commercial Hub, Bandra East" },
  { city: "New Delhi", state: "Delhi", code: "07", pincode: "110001", address: "Connaught Place Inner Circle" },
  { city: "Bengaluru", state: "Karnataka", code: "29", pincode: "560001", address: "MG Road Commercial Complex" },
  { city: "Hyderabad", state: "Telangana", code: "36", pincode: "500001", address: "HITEC City IT Corridor" },
  { city: "Pune", state: "Maharashtra", code: "27", pincode: "411001", address: "FC Road, Deccan Gymkhana" },
  { city: "Ahmedabad", state: "Gujarat", code: "24", pincode: "380001", address: "CG Road Business District" },
  { city: "Chennai", state: "Tamil Nadu", code: "33", pincode: "600001", address: "Anna Salai Business Hub" },
  { city: "Kolkata", state: "West Bengal", code: "19", pincode: "700001", address: "Park Street Commercial Zone" },
  { city: "Jaipur", state: "Rajasthan", code: "08", pincode: "302001", address: "MI Road Heritage Market" },
  { city: "Lucknow", state: "Uttar Pradesh", code: "09", pincode: "226001", address: "Hazratganj Commercial Plaza" },
  { city: "Chandigarh", state: "Punjab", code: "03", pincode: "160001", address: "Sector 17 Business Center" },
  { city: "Surat", state: "Gujarat", code: "24", pincode: "395001", address: "Ring Road Textile & Craft Market" },
  { city: "Gurgaon", state: "Haryana", code: "06", pincode: "122001", address: "Cyber City DLF Phase 2" },
  { city: "Noida", state: "Uttar Pradesh", code: "09", pincode: "201301", address: "Sector 62 IT Park" },
  { city: "Indore", state: "Madhya Pradesh", code: "23", pincode: "452001", address: "AB Road Business Tower" }
];

async function main() {
  console.log("🌱 Clearing existing data and seeding 100 People & full accounting database...");

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
  console.log(`👤 Admin user ready: ${adminUser.email}`);

  // 2. Generate 100 People / Contacts (50 Customers, 40 Vendors, 10 Both)
  const contactsToCreate = [];

  // A. 50 Individual Customers
  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const loc = locations[i % locations.length];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@gmail.com`;
    const mobile = `+91 ${9800000000 + i * 1234567 % 900000000}`;
    const gstNo = `${loc.code}ABCDE${1000 + i}F1Z${(i % 9) + 1}`;

    contactsToCreate.push({
      name,
      type: "CUSTOMER" as const,
      email,
      mobile,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      address: `${101 + i} ${loc.address}`,
      gstNo,
      status: "Active",
    });
  }

  // B. 40 Vendor Companies
  for (let i = 0; i < 40; i++) {
    const company = vendorCompanies[i % vendorCompanies.length];
    const loc = locations[(i + 3) % locations.length];
    const email = `contact@${company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15)}.co.in`;
    const mobile = `+91 ${9700000000 + i * 2345678 % 900000000}`;
    const gstNo = `${loc.code}VENDOR${2000 + i}V1Z${(i % 9) + 1}`;

    contactsToCreate.push({
      name: i > 20 ? `${company} (#${i - 19})` : company,
      type: "VENDOR" as const,
      email,
      mobile,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      address: `Plot ${45 + i}, ${loc.address}`,
      gstNo,
      status: "Active",
    });
  }

  // C. 10 Interior Design Contractors (BOTH)
  for (let i = 0; i < 10; i++) {
    const fn = firstNames[(i + 15) % firstNames.length];
    const ln = lastNames[(i + 7) % lastNames.length];
    const loc = locations[(i + 5) % locations.length];
    const name = `${fn} ${ln} Studio & Interiors`;
    const email = `info@${fn.toLowerCase()}${ln.toLowerCase()}interiors.in`;
    const mobile = `+91 ${9900000000 + i * 3456789 % 900000000}`;
    const gstNo = `${loc.code}STUDIO${3000 + i}S1Z${(i % 9) + 1}`;

    contactsToCreate.push({
      name,
      type: "BOTH" as const,
      email,
      mobile,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      address: `Studio Suite ${10 + i}, ${loc.address}`,
      gstNo,
      status: "Active",
    });
  }

  // Create contacts in DB
  const createdContacts = [];
  for (const c of contactsToCreate) {
    const created = await prisma.contact.create({ data: c });
    createdContacts.push(created);
  }
  console.log(`✅ 100 People/Contacts created in PostgreSQL database!`);

  const customers = createdContacts.filter((c) => c.type === "CUSTOMER" || c.type === "BOTH");
  const vendors = createdContacts.filter((c) => c.type === "VENDOR" || c.type === "BOTH");

  // 3. Products
  const productsData = [
    { name: "Teak Wood Dining Table 6-Seater", type: "Goods", category: "Tables", salesPrice: 48500, purchasePrice: 28000 },
    { name: "Executive Ergonomic Leather Chair", type: "Goods", category: "Chairs", salesPrice: 18500, purchasePrice: 11000 },
    { name: "Velvet 3-Seater Living Room Sofa", type: "Goods", category: "Sofas", salesPrice: 65000, purchasePrice: 38000 },
    { name: "Solid Sheesham King Size Bed Frame", type: "Goods", category: "Beds", salesPrice: 52000, purchasePrice: 31000 },
    { name: "Minimalist Oak Study Desk", type: "Goods", category: "Tables", salesPrice: 24500, purchasePrice: 14000 },
    { name: "Walnut 5-Tier Bookcase Unit", type: "Goods", category: "Storage", salesPrice: 28000, purchasePrice: 16500 },
    { name: "Modular Wooden Coffee Table", type: "Goods", category: "Tables", salesPrice: 14500, purchasePrice: 8200 },
    { name: "Modern Bar Stool (Set of 2)", type: "Goods", category: "Chairs", salesPrice: 12500, purchasePrice: 7000 },
    { name: "Brass Accent Credenza Sideboard", type: "Goods", category: "Storage", salesPrice: 42000, purchasePrice: 25000 },
    { name: "Outdoor Rattan Patio Lounge Chair", type: "Goods", category: "Chairs", salesPrice: 19500, purchasePrice: 11500 },
    { name: "Custom Interior Woodworking Service", type: "Service", category: "Services", salesPrice: 35000, purchasePrice: 15000 },
    { name: "Furniture Assembly & Delivery Service", type: "Service", category: "Services", salesPrice: 4500, purchasePrice: 2000 },
    { name: "Showroom Furniture Polish & Care Kit", type: "Goods", category: "Accessories", salesPrice: 2500, purchasePrice: 1200 },
    { name: "Luxury Recliner Armchair", type: "Goods", category: "Chairs", salesPrice: 38000, purchasePrice: 22000 },
    { name: "Tempered Glass Top Dining Table", type: "Goods", category: "Tables", salesPrice: 36000, purchasePrice: 21000 },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log(`✅ 15 Urban Furniture products created.`);

  // 4. Chart of Accounts
  const accountsData = [
    { code: "1010", name: "Cash & Bank Balance (HDFC / ICICI)", type: "ASSET" as const, category: "Cash & Bank" },
    { code: "1020", name: "Accounts Receivable (Customer Invoices)", type: "ASSET" as const, category: "Current Assets" },
    { code: "1030", name: "Timber & Furniture Inventory Valuation", type: "ASSET" as const, category: "Current Assets" },
    { code: "1510", name: "Showroom Machinery & Equipment", type: "ASSET" as const, category: "Fixed Assets" },
    { code: "2010", name: "Accounts Payable (Vendor Bills)", type: "LIABILITY" as const, category: "Current Liabilities" },
    { code: "2020", name: "GST Payable & Tax Accruals", type: "LIABILITY" as const, category: "Current Liabilities" },
    { code: "3010", name: "Owner Share Capital", type: "EQUITY" as const, category: "Equity" },
    { code: "4010", name: "Sales Revenue (Furniture Sales)", type: "REVENUE" as const, category: "Operating Revenue" },
    { code: "5010", name: "Cost of Goods Sold (Raw Materials & Freight)", type: "EXPENSE" as const, category: "Direct Expenses" },
    { code: "5020", name: "Showroom Rent & Electricity Expenses", type: "EXPENSE" as const, category: "Operating Expenses" },
  ];

  const createdAccounts = [];
  for (const a of accountsData) {
    const acc = await prisma.account.create({ data: a });
    createdAccounts.push(acc);
  }
  console.log(`✅ Chart of Accounts populated.`);

  // 5. Journals
  const journalsData = [
    { name: "Customer Sales Journal", type: "SALES" as const },
    { name: "Vendor Purchase Journal", type: "PURCHASE" as const },
    { name: "Bank & UPI Receipts Journal", type: "BANK" as const },
    { name: "Cash Disbursements Journal", type: "CASH" as const },
    { name: "General Ledger Journal", type: "GENERAL" as const },
  ];

  const createdJournals = [];
  for (const j of journalsData) {
    const jnl = await prisma.journal.create({ data: j });
    createdJournals.push(jnl);
  }
  console.log(`✅ Master Journals created.`);

  // 6. Generate 60 Sales Orders + Invoices + Receipts across 50 Customers
  let soCounter = 101;
  let invCounter = 201;
  let payCounter = 301;

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const prod = createdProducts[i % createdProducts.length];
    const qty = (i % 4) + 1;
    const price = prod.salesPrice;
    const total = qty * price;

    const orderDate = new Date(2025, 0 + (i % 5), 1 + (i % 25));
    const dueDate = new Date(orderDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const isPaid = i % 3 !== 0;

    const salesOrder = await prisma.salesOrder.create({
      data: {
        orderNo: `SO/2025/${soCounter++}`,
        contactId: customer.id,
        date: orderDate,
        status: "Confirmed",
        total,
        lines: {
          create: [
            {
              productId: prod.id,
              qty,
              price,
              amount: total,
            },
          ],
        },
        invoices: {
          create: [
            {
              invoiceNo: `INV/2025/${invCounter++}`,
              contactId: customer.id,
              date: orderDate,
              dueDate,
              status: isPaid ? "Paid" : "Open",
              total,
              lines: {
                create: [
                  {
                    productId: prod.id,
                    description: `${prod.name} (${qty} units)`,
                    qty,
                    price,
                    amount: total,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        invoices: true,
      },
    });

    // If Paid, create receipt payment
    if (isPaid && salesOrder.invoices[0]) {
      await prisma.payment.create({
        data: {
          paymentNo: `PAY/2025/${payCounter++}`,
          type: "Receive",
          contactId: customer.id,
          invoiceId: salesOrder.invoices[0].id,
          date: orderDate,
          amount: total,
          mode: i % 2 === 0 ? "Bank" : "UPI",
          reference: `UPI-REF-${88000 + i}`,
          status: "Received",
        },
      });
    }
  }
  console.log(`✅ 50+ Sales Orders, Invoices & Receipts generated for Customers.`);

  // 7. Generate 50 Purchase Orders + Vendor Bills + Payments across Vendors
  let poCounter = 401;
  let billCounter = 501;

  for (let i = 0; i < vendors.length; i++) {
    const vendor = vendors[i];
    const prod = createdProducts[(i + 2) % createdProducts.length];
    const qty = (i % 5) + 2;
    const price = prod.purchasePrice;
    const total = qty * price;

    const orderDate = new Date(2025, 0 + (i % 5), 2 + (i % 24));
    const dueDate = new Date(orderDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const isPaid = i % 2 === 0;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNo: `PO/2025/${poCounter++}`,
        contactId: vendor.id,
        date: orderDate,
        status: "Confirmed",
        total,
        lines: {
          create: [
            {
              productId: prod.id,
              qty,
              price,
              amount: total,
            },
          ],
        },
        bills: {
          create: [
            {
              billNo: `BILL/2025/${billCounter++}`,
              contactId: vendor.id,
              date: orderDate,
              dueDate,
              status: isPaid ? "Paid" : "Open",
              total,
              lines: {
                create: [
                  {
                    productId: prod.id,
                    description: `Bulk procurement of ${prod.name}`,
                    qty,
                    price,
                    amount: total,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        bills: true,
      },
    });

    if (isPaid && purchaseOrder.bills[0]) {
      await prisma.payment.create({
        data: {
          paymentNo: `PAY/2025/${payCounter++}`,
          type: "Send",
          contactId: vendor.id,
          billId: purchaseOrder.bills[0].id,
          date: orderDate,
          amount: total,
          mode: "Bank",
          reference: `HDFC-NEFT-${99000 + i}`,
          status: "Sent",
        },
      });
    }
  }
  console.log(`✅ 40+ Purchase Orders, Vendor Bills & Payments created for Vendors.`);

  // 8. Balanced Double-Entry Journal Entries
  const genJournal = createdJournals.find((j) => j.type === "GENERAL") || createdJournals[0];
  const cashAcc = createdAccounts.find((a) => a.code === "1010") || createdAccounts[0];
  const salesAcc = createdAccounts.find((a) => a.code === "4010") || createdAccounts[1];
  const expenseAcc = createdAccounts.find((a) => a.code === "5020") || createdAccounts[2];

  for (let i = 1; i <= 15; i++) {
    const amt = i * 25000;
    await prisma.journalEntry.create({
      data: {
        entryNo: `JE/2025/${String(i).padStart(3, "0")}`,
        journalId: genJournal.id,
        date: new Date(2025, i % 5, i * 2),
        reference: `REF-GL-${100 + i}`,
        narration: `Monthly accounting ledger adjustment entry #${i}`,
        totalDebit: amt,
        totalCredit: amt,
        lines: {
          create: [
            {
              accountId: cashAcc.id,
              description: `Debit cash account entry #${i}`,
              debit: amt,
              credit: 0,
            },
            {
              accountId: i % 2 === 0 ? salesAcc.id : expenseAcc.id,
              description: `Credit offsetting ledger entry #${i}`,
              debit: 0,
              credit: amt,
            },
          ],
        },
      },
    });
  }
  console.log(`✅ 15 Balanced Double-Entry Journal Entries posted to General Ledger.`);

  // 9. Financial Budgets
  const budgetsData = [
    {
      name: "Showroom Rent & Operating Utilities",
      accountName: "Showroom Rent & Electricity Expenses",
      plannedAmount: 450000,
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 11, 31),
    },
    {
      name: "Timber & Raw Wood Sourcing Budget",
      accountName: "Cost of Goods Sold (Raw Materials & Freight)",
      plannedAmount: 850000,
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 11, 31),
    },
    {
      name: "Marketing & Furniture Expo Exhibitions",
      accountName: "Sales Revenue (Furniture Sales)",
      plannedAmount: 250000,
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 11, 31),
    },
    {
      name: "Warehouse Woodworking Machinery Upgrades",
      accountName: "Showroom Machinery & Equipment",
      plannedAmount: 350000,
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 11, 31),
    },
    {
      name: "Workshop Staff Payroll & Transport Logistics",
      accountName: "Cost of Goods Sold (Raw Materials & Freight)",
      plannedAmount: 500000,
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 11, 31),
    },
  ];

  for (const b of budgetsData) {
    await prisma.budget.create({ data: b });
  }
  console.log(`✅ Financial Budgets created.`);

  console.log("🎉 Comprehensive Database Seeding Completed with 100 People/Contacts!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
