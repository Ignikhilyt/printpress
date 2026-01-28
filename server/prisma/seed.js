const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Admin (password: Admin123456 - meets requirements: uppercase, lowercase, number)
  const hashedPassword = await bcrypt.hash('Admin123456', 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@printpress.com' },
    update: {},
    create: {
      email: 'admin@printpress.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Institutes
  const institute1 = await prisma.institute.upsert({
    where: { slug: 'vision-ias' },
    update: {},
    create: {
      name: 'Vision IAS',
      slug: 'vision-ias',
      description: 'Premier IAS coaching institute',
    },
  });

  const institute2 = await prisma.institute.upsert({
    where: { slug: 'vajiram-ravi' },
    update: {},
    create: {
      name: 'Vajiram & Ravi',
      slug: 'vajiram-ravi',
      description: 'Leading UPSC preparation institute',
    },
  });

  const institute3 = await prisma.institute.upsert({
    where: { slug: 'kiran-publications' },
    update: {},
    create: {
      name: 'Kiran Publications',
      slug: 'kiran-publications',
      description: 'SSC & Banking exam materials',
    },
  });

  console.log('✅ Institutes created');

  // Create Notes
  await prisma.note.upsert({
    where: { slug: 'indian-polity-complete-notes' },
    update: {},
    create: {
      title: 'Indian Polity Complete Notes',
      slug: 'indian-polity-complete-notes',
      description: 'Comprehensive notes covering entire Indian Polity syllabus',
      subject: 'Indian Polity',
      category: 'UPSC',
      pdfUrl: '/uploads/sample.pdf',
      pdfFileName: 'polity.pdf',
      pageCount: 450,
      pricePerPage: 1.5,
      isFeatured: true,
      instituteId: institute1.id,
    },
  });

  await prisma.note.upsert({
    where: { slug: 'modern-indian-history' },
    update: {},
    create: {
      title: 'Modern Indian History',
      slug: 'modern-indian-history',
      description: 'Complete modern Indian history from 1857 to independence',
      subject: 'History',
      category: 'UPSC',
      pdfUrl: '/uploads/sample.pdf',
      pdfFileName: 'history.pdf',
      pageCount: 380,
      pricePerPage: 1.5,
      isFeatured: true,
      instituteId: institute2.id,
    },
  });

  await prisma.note.upsert({
    where: { slug: 'ssc-quantitative-aptitude' },
    update: {},
    create: {
      title: 'SSC Quantitative Aptitude',
      slug: 'ssc-quantitative-aptitude',
      description: 'Complete QA notes with solved examples',
      subject: 'Quantitative Aptitude',
      category: 'SSC',
      pdfUrl: '/uploads/sample.pdf',
      pdfFileName: 'quant.pdf',
      pageCount: 520,
      pricePerPage: 1.0,
      isFeatured: true,
      instituteId: institute3.id,
    },
  });

  await prisma.note.upsert({
    where: { slug: 'geography-ncert' },
    update: {},
    create: {
      title: 'Geography NCERT Compilation',
      slug: 'geography-ncert',
      description: 'All NCERT geography chapters compiled',
      subject: 'Geography',
      category: 'UPSC',
      pdfUrl: '/uploads/sample.pdf',
      pdfFileName: 'geography.pdf',
      pageCount: 280,
      pricePerPage: 1.2,
      isFeatured: false,
      instituteId: institute1.id,
    },
  });

  console.log('✅ Notes created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });