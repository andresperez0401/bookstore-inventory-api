import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run seed');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookstore.com' },
    update: {},
    create: {
      email: 'admin@bookstore.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create sample books
  const books = [
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      costUsd: 29.99,
      stockQuantity: 25,
      category: 'Programming',
      supplierCountry: 'US',
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'David Thomas, Andrew Hunt',
      isbn: '9780135957059',
      costUsd: 34.99,
      stockQuantity: 15,
      category: 'Programming',
      supplierCountry: 'US',
    },
    {
      title: 'Don Quijote de la Mancha',
      author: 'Miguel de Cervantes',
      isbn: '9788491050193',
      costUsd: 12.5,
      stockQuantity: 40,
      category: 'Fiction',
      supplierCountry: 'ES',
    },
    {
      title: 'One Hundred Years of Solitude',
      author: 'Gabriel García Márquez',
      isbn: '9780060883287',
      costUsd: 10.99,
      stockQuantity: 30,
      category: 'Fiction',
      supplierCountry: 'CO',
    },
    {
      title: 'Design Patterns',
      author: 'Gang of Four',
      isbn: '9780201633610',
      costUsd: 42.0,
      stockQuantity: 5,
      category: 'Programming',
      supplierCountry: 'US',
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }
  console.log(`✅ ${books.length} sample books created`);

  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
