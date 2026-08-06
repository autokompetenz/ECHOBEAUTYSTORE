const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['error'],
  });
}

const prisma = globalForPrisma.prisma;

module.exports = { prisma };
