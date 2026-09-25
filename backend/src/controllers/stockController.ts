import { Response } from 'express';
import { prisma } from '../config/prisma';

// Réapprovisionner le stock pour un produit donné
export const supplyStock = async (req: any, res: Response) => {
  try {
    const barId = req.barId || req.bar?.id;
    if (!barId) {
      return res.status(401).json({ message: "Établissement non authentifié." });
    }

    const { productId, nombreCasiers, bouteillesIndividuelles } = req.body;

    if (!productId || (nombreCasiers === undefined && bouteillesIndividuelles === undefined)) {
      return res.status(400).json({ message: "ID produit et quantité requis." });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    const bouteillesAjoutees = 
      ((parseInt(nombreCasiers) || 0) * product.bouteillesParCasier) + 
      (parseInt(bouteillesIndividuelles) || 0);

    const stockUpdated = await prisma.stock.upsert({
      where: {
        barId_productId: {
          barId,
          productId
        }
      },
      update: {
        quantiteBouteilles: { increment: bouteillesAjoutees }
      },
      create: {
        barId,
        productId,
        quantiteBouteilles: bouteillesAjoutees,
        casiersVides: 0
      }
    });

    return res.status(200).json({ message: "Stock réapprovisionné avec succès", stock: stockUpdated });
  } catch (error: any) {
    console.error("Erreur supplyStock:", error);
    return res.status(500).json({ message: "Erreur lors du réapprovisionnement", error: error.message });
  }
};

// Récupérer l'état du stock complet
export const getStockStatus = async (req: any, res: Response) => {
  try {
    const barId = req.barId || req.bar?.id;
    if (!barId) {
      return res.status(401).json({ message: "Établissement non authentifié." });
    }

    const stocks = await prisma.stock.findMany({
      where: { barId },
      include: { product: true }
    });

    return res.status(200).json(stocks);
  } catch (error: any) {
    console.error("Erreur getStockStatus:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des stocks", error: error.message });
  }
};

// Enregistrer le retour d'emballages vides
export const returnEmptyCrates = async (req: any, res: Response) => {
  try {
    const barId = req.barId || req.bar?.id;
    if (!barId) return res.status(401).json({ message: "Établissement non authentifié." });

    const { productId, casiersRetournes, rembourser } = req.body;
    if (!productId || casiersRetournes === undefined) {
      return res.status(400).json({ message: "ID produit et quantité de casiers retournés requis." });
    }

    const stockUpdated = await prisma.stock.update({
      where: { barId_productId: { barId, productId } },
      data: { casiersVides: { increment: Number(casiersRetournes) } }
    });

    if (rembourser) {
      await prisma.expense.create({
        data: {
          barId,
          motif: `Remboursement Consigne (${casiersRetournes} casiers)`,
          montant: Number(casiersRetournes) * 2000,
          categorie: "CHARGES"
        }
      });
    }

    return res.status(200).json({ message: "Retour d'emballages enregistré.", stock: stockUpdated });
  } catch (error: any) {
    console.error("Erreur returnEmptyCrates:", error);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement.", error: error.message });
  }
};

export const manualStockAdjustment = async (req: any, res: Response) => {
  try {
    const barId = req.barId || req.bar?.id;
    const { productId, nouvelleQuantite, reason } = req.body;

    if (!barId) return res.status(401).json({ message: "Établissement non authentifié." });
    if (!productId || nouvelleQuantite === undefined) {
      return res.status(400).json({ message: "ID produit et nouvelle quantité requis." });
    }

    const stock = await prisma.stock.findUnique({
      where: { barId_productId: { barId, productId } },
      include: { product: true }
    });

    if (!stock) return res.status(404).json({ message: "Stock non trouvé." });

    const ancienneQuantite = stock.quantiteBouteilles;
    const ecart = Number(nouvelleQuantite) - ancienneQuantite;

    await prisma.$transaction(async (tx) => {
      await tx.stock.update({
        where: { id: stock.id },
        data: { quantiteBouteilles: Number(nouvelleQuantite) }
      });

      await tx.auditLog.create({
        data: {
          barId,
          action: 'AJUSTEMENT_MANUEL_STOCK',
          details: JSON.stringify({ 
            productId, 
            produit: stock.product.nom,
            ancienneQuantite, 
            nouvelleQuantite, 
            ecart,
            reason 
          })
        }
      });
    });

    return res.status(200).json({ message: "Stock ajusté avec succès." });
  } catch (error: any) {
    console.error("Erreur manualStockAdjustment:", error);
    return res.status(500).json({ message: "Erreur lors de l'ajustement du stock.", error: error.message });
  }
};