import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user (if needed)
  // This is a placeholder - actual seeding should use proper password hashing
  console.log('Database seeding...');
  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

