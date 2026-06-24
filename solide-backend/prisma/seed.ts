import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Solide@2026', 12)
  await prisma.admin.upsert({
    where: { email: 'admin@solide.com' },
    update: {},
    create: {
      email: 'admin@solide.com',
      passwordHash: hash,
      name: 'Solide Admin',
    },
  })
  console.log('Admin user created: admin@solide.com / Solide@2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
