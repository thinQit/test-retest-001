import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await hashPassword('admin123');
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        passwordHash,
        role: 'admin'
      }
    });
  }

  const featureCount = await prisma.feature.count();
  if (featureCount === 0) {
    await prisma.feature.create({
      data: {
        title: 'Fast Setup',
        description: 'Launch quickly with a clean, modern scaffold.',
        order: 1
      }
    });
    await prisma.feature.create({
      data: {
        title: 'Dynamic Content',
        description: 'Features are managed via API and reflected instantly.',
        order: 2
      }
    });
    await prisma.feature.create({
      data: {
        title: 'Secure Admin',
        description: 'JWT-based admin access with role protection.',
        order: 3
      }
    });
  }

  const contactCount = await prisma.contactSubmission.count();
  if (contactCount === 0) {
    await prisma.contactSubmission.create({
      data: {
        name: 'Jamie Doe',
        email: 'jamie@example.com',
        message: 'Interested in learning more about your services.',
        source: 'seed'
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
