import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

console.log('Connexion vers :', process.env.DATABASE_URL?.split('@')[1] || 'URL NON TROUVÉE');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  // @ts-ignore
  family: 4, // Force IPv4 (Contourne le bug DNS/IPv6 de WSL)
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });