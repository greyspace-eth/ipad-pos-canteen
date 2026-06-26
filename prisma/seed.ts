import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MENU_ITEMS = [
  { name: 'White Rice',         price: 80,   cat: 'Rice' },
  { name: 'Yam Rice',           price: 120,  cat: 'Rice' },
  { name: 'Brown Rice',         price: 100,  cat: 'Rice' },
  { name: 'Sweet & Sour Pork',  price: 200,  cat: 'Meat' },
  { name: 'Curry Chicken',      price: 180,  cat: 'Meat' },
  { name: 'Braised Pork Belly', price: 220,  cat: 'Meat' },
  { name: 'Fried Fish',         price: 250,  cat: 'Meat' },
  { name: 'Char Siew',          price: 200,  cat: 'Meat' },
  { name: 'Salted Egg Chicken', price: 250,  cat: 'Meat' },
  { name: 'Stir-fried Cabbage', price: 100,  cat: 'Vegetable' },
  { name: 'Long Beans',         price: 120,  cat: 'Vegetable' },
  { name: 'Braised Tofu',       price: 100,  cat: 'Vegetable' },
  { name: 'Sambal Eggplant',    price: 150,  cat: 'Vegetable' },
  { name: 'Beansprouts',        price: 100,  cat: 'Vegetable' },
  { name: 'Fried Egg',          price: 80,   cat: 'Extra' },
  { name: 'Egg Omelette',       price: 120,  cat: 'Extra' },
  { name: 'Ngoh Hiang',         price: 150,  cat: 'Extra' },
  { name: 'Tau Pok',            price: 80,   cat: 'Extra' },
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
