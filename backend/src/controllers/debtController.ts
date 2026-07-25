import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Récupérer toutes les ventes sous forme d'ardoises (non payées)
export const getActiveDebts = async (req: any, res: Response) => {
  try {
    const barId = req.bar.Id;

    const activeDebts = await prisma.sale.findMany({
      where: {
        barId,
        status: "EN_ATTENTE",
        paymentMode: "ARDOISE"
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(activeDebts);
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la récupération des ardoises", error: error.message });
  }
};

// Marquer une ardoise comme réglée
export const payDebt = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMode } = req.body; // ESPECES, AIRTEL_MONEY, MOOV_MONEY

    const saleExistante = await prisma.sale.findUnique({
      where: { id }
    });

    if (!saleExistante) {
      return res.status(404).json({ message: "Ardoise introuvable" });
    }

    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        status: "PAYE",
        paymentMode: paymentMode || saleExistante.paymentMode
      }
    });

    return res.status(200).json({ message: "Ardoise réglée avec succès", sale: updatedSale });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors du règlement de l'ardoise", error: error.message });
  }
};