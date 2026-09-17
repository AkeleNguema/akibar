import { prisma } from './src/config/prisma';

async function testTransaction() {
  try {
    const saleResult = await prisma.$transaction(async (tx) => {
      const newDebt = await tx.sale.create({
        data: {
          barId: 'REG45bar',
          totalAmount: 1000,
          paymentMode: "ARDOISE",
          nomClient: 'Lee',
          status: "EN_ATTENTE",
          items: undefined
        },
        include: { items: true }
      });
      return newDebt;
    });
    console.log(saleResult);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testTransaction();
