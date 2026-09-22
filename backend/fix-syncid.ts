import 'dotenv/config';
import { prisma } from './src/config/prisma';
import crypto from 'crypto';

async function main() {
  console.log("Recherche des ventes...");
  const sales = await prisma.sale.findMany();
  
  const syncIds = new Set<string>();
  let updatedCount = 0;

  for (const sale of sales) {
    if (sale.syncId) {
      if (syncIds.has(sale.syncId) || sale.syncId.trim() === '') {
        // Doublon ou vide, on remplace
        const newSyncId = crypto.randomUUID();
        await prisma.sale.update({
          where: { id: sale.id },
          data: { syncId: newSyncId }
        });
        syncIds.add(newSyncId);
        updatedCount++;
      } else {
        syncIds.add(sale.syncId);
      }
    } else {
      // syncId est null, ce qui est généralement permis pour un champ @unique,
      // mais on peut lui assigner un uuid par sécurité
      const newSyncId = crypto.randomUUID();
      await prisma.sale.update({
        where: { id: sale.id },
        data: { syncId: newSyncId }
      });
      syncIds.add(newSyncId);
      updatedCount++;
    }
  }

  console.log(`Mise à jour terminée. ${updatedCount} ventes corrigées.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
