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