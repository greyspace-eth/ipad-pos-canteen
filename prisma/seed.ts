import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MENU_ITEMS = [
  { name: 'White Rice',         price: 80,   cat: 'Fixed Price' },
  { name: 'Yam Rice',           price: 120,  cat: 'Fixed Price' },
  { name: 'Brown Rice',         price: 100,  cat: 'Fixed Price' },
  { name: 'Sweet & Sour Pork',  price: 200,  cat: 'Fixed Price' },
  { name: 'Curry Chicken',      price: 180,  cat: 'Fixed Price' },
  { name: 'Braised Pork Belly', price: 220,  cat: 'Fixed Price' },
  { name: 'Fried Fish',         price: 250,  cat: 'Fixed Price' },
  { name: 'Char Siew',          price: 200,  cat: 'Fixed Price' },
  { name: 'Salted Egg Chicken', price: 250,  cat: 'Fixed Price' },
  { name: 'Stir-fried Cabbage', price: 100,  cat: 'Fixed Price' },
  { name: 'Long Beans',         price: 120,  cat: 'Fixed Price' },
  { name: 'Braised Tofu',       price: 100,  cat: 'Fixed Price' },
  { name: 'Sambal Eggplant',    price: 150,  cat: 'Fixed Price' },
  { name: 'Beansprouts',        price: 100,  cat: 'Fixed Price' },
  { name: 'Fried Egg',          price: 80,   cat: 'Others' },
  { name: 'Egg Omelette',       price: 120,  cat: 'Others' },
  { name: 'Ngoh Hiang',         price: 150,  cat: 'Others' },
  { name: 'Tau Pok',            price: 80,   cat: 'Others' },
];

async function main() {
  console.log('Seeding menu items…');

  await prisma.menuItem.deleteMany();

  for (const item of MENU_ITEMS) {
    await prisma.menuItem.create({ data: item });
  }

  console.log(`Seeded ${MENU_ITEMS.length} menu items.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
