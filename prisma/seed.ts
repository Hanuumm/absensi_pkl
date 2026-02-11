import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@company.com",
      password: adminPassword,
      role: "ADMIN",
      position: "System Administrator",
    },
  });

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: "budi@company.com" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "budi@company.com",
      password: userPassword,
      role: "USER",
      position: "Staff",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "siti@company.com" },
    update: {},
    create: {
      name: "Siti Rahayu",
      email: "siti@company.com",
      password: userPassword,
      role: "USER",
      position: "Staff",
    },
  });

  console.log("Seeding selesai!");
  console.log({ admin, user1, user2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
