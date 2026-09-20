// One shared Prisma client for the whole app (module cache makes this a singleton).
const { PrismaClient } = require('@prisma/client');

module.exports = new PrismaClient();
