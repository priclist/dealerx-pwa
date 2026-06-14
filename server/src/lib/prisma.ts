import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '.prisma/client'

type PrismaClientType = InstanceType<typeof PrismaClient>

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType }

function createPrismaClient(): PrismaClientType {
  const connectionString = process.env.DATABASE_URL as string
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter, errorFormat: 'minimal' })
}

export const prisma: PrismaClientType =
  globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
