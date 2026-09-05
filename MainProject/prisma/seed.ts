import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const samplePeopleContacts = [
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

async function main() {
  console.log("🌱 Starting Database Seeding with 10 Contact Records...");

  // 1. Seed Admin User if not exists
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

  // 2. Seed 10 People / Contacts
  let seededCount = 0;
  for (const contactData of samplePeopleContacts) {
    const existing = await prisma.contact.findFirst({
      where: { name: contactData.name },
    });

    if (!existing) {
      await prisma.contact.create({
        data: contactData,
      });
      seededCount++;
    }
  }

  console.log(`✅ Successfully seeded ${seededCount} contact records into the database!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
