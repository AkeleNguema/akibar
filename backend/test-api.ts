import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { prisma } from './src/config/prisma';

async function main() {
  const bar = await prisma.bar.findFirst();
  if (!bar) {
    console.log("No bar found.");
    return;
  }

  const token = jwt.sign({ barId: bar.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

  try {
    const res = await fetch('http://localhost:5000/api/tables', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body: ${text}`);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

main().finally(() => prisma.$disconnect());
