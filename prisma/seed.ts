
import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    email: "john@gmail.com",
    phone: "0771234567",
    firstName: "John",
    lastName: "Perera",
    password: "$2a$12$dNApuO6jY40cNQxh9c535u8s6mB3XpmMXAdxdYCwiy0MT0hOfKwsO",
    role: "Admin",
    status: "ACTIVE",
    privileges: [],
  }
  
];

export async function main() {
  console.log("Starting user seeding...");

  for (const u of userData) {
    await prisma.user.create({
      data: u,
    });

    console.log(`Created user: ${u.email}`);
  }

  console.log("User seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
