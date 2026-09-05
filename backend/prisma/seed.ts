import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---- Accounts (system defaults) ----
  const cash = await prisma.account.upsert({
    where: { name: 'Cash' },
    update: {},
    create: { name: 'Cash', type: 'asset', isSystemDefault: true },
  });
  const bank = await prisma.account.upsert({
    where: { name: 'Bank' },
    update: {},
    create: { name: 'Bank', type: 'asset', isSystemDefault: true },
  });
  const debtors = await prisma.account.upsert({
    where: { name: 'Debtors' },
    update: {},
    create: { name: 'Debtors', type: 'asset', isSystemDefault: true },
  });
  const creditors = await prisma.account.upsert({
    where: { name: 'Creditors' },
    update: {},
    create: { name: 'Creditors', type: 'liability', isSystemDefault: true },
  });
  const taxPayable = await prisma.account.upsert({
    where: { name: 'Tax Payable' },
    update: {},
    create: { name: 'Tax Payable', type: 'liability', isSystemDefault: true },
  });
  const saleIncome = await prisma.account.upsert({
    where: { name: 'Sale Income' },
    update: {},
    create: { name: 'Sale Income', type: 'income', isSystemDefault: true },
  });
  const purchaseExpense = await prisma.account.upsert({
    where: { name: 'Purchase Expense' },
    update: {},
    create: { name: 'Purchase Expense', type: 'expense', isSystemDefault: true },
  });

  console.log('✅ Accounts seeded');

  // ---- Journals ----
  await prisma.journal.upsert({
    where: { id: 'journal-sales' },
    update: {},
    create: {
      id: 'journal-sales',
      name: 'Sales Journal',
      type: 'sales',
      defaultAccountId: saleIncome.id,
    },
  });
  await prisma.journal.upsert({
    where: { id: 'journal-purchase' },
    update: {},
    create: {
      id: 'journal-purchase',
      name: 'Purchase Journal',
      type: 'purchase',
      defaultAccountId: purchaseExpense.id,
    },
  });
  await prisma.journal.upsert({
    where: { id: 'journal-bank' },
    update: {},
    create: {
      id: 'journal-bank',
      name: 'Bank Journal',
      type: 'bank',
      defaultAccountId: bank.id,
    },
  });
  await prisma.journal.upsert({
    where: { id: 'journal-cash' },
    update: {},
    create: {
      id: 'journal-cash',
      name: 'Cash Journal',
      type: 'cash',
      defaultAccountId: cash.id,
    },
  });

  console.log('✅ Journals seeded');

  // ---- Contacts ----
  const rahul = await prisma.contact.upsert({
    where: { id: 'contact-rahul' },
    update: {},
    create: {
      id: 'contact-rahul',
      name: 'Rahul Sharma',
      type: 'vendor',
      email: 'rahul@vendor.com',
      mobile: '9876543210',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
  });
  await prisma.contact.upsert({
    where: { id: 'contact-azure' },
    update: {},
    create: {
      id: 'contact-azure',
      name: 'Azure Furniture',
      type: 'vendor',
      email: 'sales@azurefurniture.com',
      mobile: '9123456789',
      city: 'Delhi',
      state: 'Delhi',
    },
  });
  const nimesh = await prisma.contact.upsert({
    where: { id: 'contact-nimesh' },
    update: {},
    create: {
      id: 'contact-nimesh',
      name: 'Nimesh Pathak',
      type: 'customer',
      email: 'nimesh@example.com',
      mobile: '9988776655',
      city: 'Ahmedabad',
      state: 'Gujarat',
    },
  });

  console.log('✅ Contacts seeded');

  // ---- Products ----
  await prisma.product.upsert({
    where: { id: 'product-chair' },
    update: {},
    create: {
      id: 'product-chair',
      name: 'Office Chair',
      type: 'goods',
      salesPrice: 3000,
      costPrice: 1800,
      category: 'Seating',
    },
  });
  await prisma.product.upsert({
    where: { id: 'product-table' },
    update: {},
    create: {
      id: 'product-table',
      name: 'Wooden Table',
      type: 'goods',
      salesPrice: 8000,
      costPrice: 5000,
      category: 'Tables',
    },
  });
  await prisma.product.upsert({
    where: { id: 'product-sofa' },
    update: {},
    create: {
      id: 'product-sofa',
      name: 'Sofa',
      type: 'goods',
      salesPrice: 25000,
      costPrice: 16000,
      category: 'Seating',
    },
  });
  await prisma.product.upsert({
    where: { id: 'product-dining' },
    update: {},
    create: {
      id: 'product-dining',
      name: 'Dining Table',
      type: 'goods',
      salesPrice: 15000,
      costPrice: 9500,
      category: 'Tables',
    },
  });

  console.log('✅ Products seeded');

  // ---- Counters ----
  const counterKeys = ['PO', 'BILL', 'SO', 'INV', 'PAY'];
  for (const key of counterKeys) {
    await prisma.counter.upsert({
      where: { key },
      update: {},
      create: { key, seq: 0 },
    });
  }

  console.log('✅ Counters seeded');

  // ---- Users ----
  const adminPassword = 'Admin@123';
  const accountantPassword = 'Account@123';
  const contactPassword = 'Contact@123';

  await prisma.user.upsert({
    where: { email: 'admin@urbanfurniture.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@urbanfurniture.com',
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'accountant@urbanfurniture.com' },
    update: {},
    create: {
      name: 'Sarah Accountant',
      email: 'accountant@urbanfurniture.com',
      passwordHash: await bcrypt.hash(accountantPassword, 12),
      role: 'accountant',
    },
  });

  await prisma.user.upsert({
    where: { email: 'nimesh@example.com' },
    update: {},
    create: {
      name: 'Nimesh Pathak',
      email: 'nimesh@example.com',
      passwordHash: await bcrypt.hash(contactPassword, 12),
      role: 'contact',
      contactId: nimesh.id,
    },
  });

  console.log('✅ Users seeded');

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║         URBAN FURNITURE — SEED COMPLETE    ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log('║  Role        │ Email                       ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Admin       │ admin@urbanfurniture.com    ║`);
  console.log(`║  Password    │ ${adminPassword}                      ║`);
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Accountant  │ accountant@urbanfurniture.com`);
  console.log(`║  Password    │ ${accountantPassword}                   ║`);
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Contact     │ nimesh@example.com          ║`);
  console.log(`║  Password    │ ${contactPassword}                   ║`);
  console.log('╚════════════════════════════════════════════╝\n');

  // suppress unused var warning
  void rahul;
  void taxPayable;
  void creditors;
  void debtors;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
