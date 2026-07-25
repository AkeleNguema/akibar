import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;
  const { productId, quantite, paymentMode, nomClient } = req.body;

  if (!barId) {
    res.status(401).json({ error: 'Bar non identifié.' });
    return;
  }

  if (!productId || !quantite || quantite <= 0) {
    res.status(400).json({ error: 'Produit et quantité valide requis.' });
    return;
  }

  try {
    // 💡 Ajout des options maxWait et timeout en 2nd argument
    const saleResult = await prisma.$transaction(
      async (tx) => {
        // 1. Récupérer le produit pour connaître son prix de vente et son prix d'achat
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error('Produit introuvable.');
        }

        // 2. Vérifier le stock disponible
        const stock = await tx.stock.findFirst({
          where: { barId, productId },
        });

        if (!stock || stock.quantiteBouteilles < quantite) {
          throw new Error('Stock insuffisant pour réaliser cette vente.');
        }

        // Calcul des prix
        const prixUnitaireVente = product.prixVenteBouteille;
        const prixUnitaireAchat = product.prixAchatCasier / product.bouteillesParCasier;
        const totalAmount = prixUnitaireVente * quantite;

        // 3. Déduire les bouteilles vendues du stock
        const updatedStock = await tx.stock.update({
          where: { id: stock.id },
          data: {
            quantiteBouteilles: { decrement: quantite },
          },
        });

        // 4. Créer la vente principale
        const sale = await tx.sale.create({
          data: {
            barId,
            totalAmount,
            paymentMode: paymentMode || 'ESPECES',
            status: paymentMode === 'ARDOISE' ? 'EN_ATTENTE' : 'PAYE',
            nomClient: nomClient || null,
            items: {
              create: [
                {
                  productId,
                  quantite,
                  prixUnitaireVente,
                  prixUnitaireAchat,
                  typeVente: 'VENTE',
                },
              ],
            },
          },
          include: {
            items: true,
          },
        });

        return { sale, updatedStock };
      },
      {
        maxWait: 10000, // Attente max pour obtenir une connexion du pool (10s)
        timeout: 15000,  // Délai max d'exécution de la transaction (15s)
      }
    );

    res.status(201).json({
      message: 'Vente enregistrée avec succès !',
      data: saleResult,
    });
  } catch (error: any) {
    console.error('Erreur lors de la vente:', error);
    res.status(400).json({ error: error.message || 'Erreur lors de la vente.' });
  }
};