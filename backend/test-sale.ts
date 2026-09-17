import { prisma } from './src/config/prisma';
import crypto from 'crypto';

async function testSale() {
  const bar = await prisma.bar.findFirst();
  if (!bar) {
    console.log("Aucun bar trouvé.");
    return;
  }
  
  const product = await prisma.product.findFirst({ where: { barId: bar.id } });
  if (!product) {
    console.log("Aucun produit trouvé.");
    return;
  }
  
  const stock = await prisma.stock.findFirst({ where: { barId: bar.id, productId: product.id } });
  if (!stock) {
    console.log("Aucun stock trouvé pour le produit.");
    return;
  }
  
  console.log(`Produit: ${product.nom}, Stock actuel: ${stock.quantiteBouteilles}`);
  
  try {
    const saleResult = await prisma.$transaction(
      async (tx) => {
        const item = { productId: product.id, quantite: 1 };
        const paymentMode = 'ESPECES';
        const syncId = crypto.randomUUID();
        
        const prixUnitaireVente = product.prixVenteBouteille;
        // ATTENTION : prixUnitaireAchat peut être un float avec plein de décimales, ou pire si bouteillesParCasier = 0
        const prixUnitaireAchat = product.prixAchatCasier / product.bouteillesParCasier;
        const calculatedTotal = prixUnitaireVente * item.quantite;

        await tx.stock.update({
          where: { id: stock.id },
          data: { quantiteBouteilles: { decrement: item.quantite } },
        });

        const saleItemsData = [{
          productId: item.productId,
          quantite: item.quantite,
          prixUnitaireVente,
          prixUnitaireAchat,
          typeVente: 'VENTE',
        }];

        const sale = await tx.sale.create({
          data: {
            barId: bar.id,
            totalAmount: calculatedTotal,
            paymentMode,
            status: 'PAYE',
            syncId,
            items: {
              create: saleItemsData,
            },
          },
          include: { items: true },
        });

        return { sale };
      }
    );
    console.log("Vente réussie !", saleResult);
  } catch (error) {
    console.error("Erreur lors de la vente:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSale();
