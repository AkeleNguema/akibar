import { prisma } from './src/config/prisma';

async function test() {
  try {
    const bar = await prisma.bar.findUnique({ where: { id: "test" } });
    console.log("Success", bar);
  } catch (e: any) {
    console.error("FULL ERROR DETAILS:");
    console.error(e.name);
    console.error(e.code);
    console.error(e.meta);
    console.error(e.message);
  }
}
test();
