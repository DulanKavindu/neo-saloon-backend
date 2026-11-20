
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
    password: "$2a$12$sHIJ4siqxIfbFXlWSAzX/u1dQJ9TJ.8AZ9vuIWyJ9di6HzhG1tPwq",
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
