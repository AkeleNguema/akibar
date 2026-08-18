import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du seed Akibar...');

  //  Création / Vérification du Bar de test
  const pinHash = await bcrypt.hash('1234', 10);
  const bar = await prisma.bar.upsert({
    where: { id: 'REG45bar' },
    update: {},
    create: {
      id: 'REG45bar',
      nomBar: 'Le Contournement',
      pinHash: pinHash, // Code PIN par défaut : 1234
    },
  });

  console.log(`✅ Bar prêt : ${bar.nomBar} (${bar.id})`);

  // 2. Catalogue Sobraga complet avec la gamme Booster
  const boissons = [
    // Bières & Alcomix (Booster)
    { nom: 'Booster Whisky Cola 50cl', categorie: 'Alcomix', prixAchatCasier: 12000, prixVenteBouteille: 800, stock: 48 },
    { nom: 'Booster Cider 50cl', categorie: 'Alcomix', prixAchatCasier: 12000, prixVenteBouteille: 800, stock: 48 },
    { nom: 'Régab 65cl', categorie: 'Bière', prixAchatCasier: 10000, prixVenteBouteille: 600, stock: 120 },
    { nom: 'Castel Beer 65cl', categorie: 'Bière', prixAchatCasier: 11000, prixVenteBouteille: 600, stock: 72 },
    { nom: 'Beaufort Lager 65cl', categorie: 'Bière', prixAchatCasier: 12000, prixVenteBouteille: 800, stock: 48 },
    { nom: 'Doppel Munich 50cl', categorie: 'Bière', prixAchatCasier: 13000, prixVenteBouteille: 800, stock: 36 },
    { nom: '33 Export 65cl', categorie: 'Bière', prixAchatCasier: 10000, prixVenteBouteille: 600, stock: 96 },
    { nom: 'Guinness 33cl', categorie: 'Bière', prixAchatCasier: 15000, prixVenteBouteille: 1000, stock: 24 },
    
    // Sodas & Energy Drinks
    { nom: 'XXL Energy 33cl', categorie: 'Energy', prixAchatCasier: 10000, prixVenteBouteille: 600, stock: 60 },
    { nom: 'Djino Pamplemousse 65cl', categorie: 'Soda', prixAchatCasier: 9000, prixVenteBouteille: 500, stock: 48 },
    { nom: 'Coca-Cola 33cl', categorie: 'Soda', prixAchatCasier: 8500, prixVenteBouteille: 500, stock: 60 },
    { nom: 'World Cola 65cl', categorie: 'Soda', prixAchatCasier: 8000, prixVenteBouteille: 500, stock: 36 },
  ];

  for (const b of boissons) {
    const product = await prisma.product.upsert({
      where: {
        barId_nom: {
          barId: bar.id,
          nom: b.nom,
        },
      },
      update: {
        prixAchatCasier: b.prixAchatCasier,
        prixVenteBouteille: b.prixVenteBouteille,
        categorie: b.categorie,
      },
      create: {
        barId: bar.id,
        nom: b.nom,
        categorie: b.categorie,
        prixAchatCasier: b.prixAchatCasier,
        prixVenteBouteille: b.prixVenteBouteille,
        bouteillesParCasier: 24,
      },
    });

    // Création / Mises à jour du stock
    await prisma.stock.upsert({
      where: {
        barId_productId: {
          barId: bar.id,
          productId: product.id,
        },
      },
      update: {
        quantiteBouteilles: b.stock,
      },
      create: {
        barId: bar.id,
        productId: product.id,
        quantiteBouteilles: b.stock,
        casiersVides: 0,
      },
    });
  }

  console.log('✅ Booster & Catalogue Sobraga mis à jour avec succès dans Neon !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });