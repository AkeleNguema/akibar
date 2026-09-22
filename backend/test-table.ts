import 'dotenv/config';
import { prisma } from './src/config/prisma';

async function main() {
  try {
    console.log("Testing Prisma Table model...");
    // Let's try to query a bar to use its ID
    const bar = await prisma.bar.findFirst();
    if (!bar) {
      console.log("No bar found.");
      return;
    }
    const barId = bar.id;
    console.log(`Using barId: ${barId}`);

    const tables = await prisma.table.findMany({
      where: { barId },
      orderBy: { nom: 'asc' }
    });

    console.log(`Found ${tables.length} tables.`);
  } catch (error) {
    console.error("Prisma error:", error);
  }
}

main().finally(() => prisma.$disconnect());
