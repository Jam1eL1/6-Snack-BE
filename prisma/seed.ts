import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { companyMockData } from "./mocks/company.mock";
import { userMockData } from "./mocks/user.mock";
import { monthlyBudgetMockData } from "./mocks/monthly-budget.mock";
import { categoryMockData } from "./mocks/category.mock";
import { productMockData } from "./mocks/product.mock";
import { cartItemMockData } from "./mocks/cart-item.mock";
import { orderMockData } from "./mocks/order.mock";
import { receiptMockData } from "./mocks/receipt.mock";
import { inviteMockData } from "./mocks/invite.mock";
import { favoriteMockData } from "./mocks/favorite.mock";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Delete all data (ordered to respect foreign key constraints)
  console.log("🗑️ Deleting existing data...");

  // 1. Delete Receipt (depends on Order)
  console.log("🗑️ Deleting receipts...");
  await prisma.receipt.deleteMany();

  // 2. Delete Payment (depends on Order)
  console.log("🗑️ Deleting payments...");
  await prisma.payment.deleteMany();

  // 3. Delete Order (depends on User, Company)
  console.log("🗑️ Deleting orders...");
  await prisma.order.deleteMany();

  // 4. Delete Favorite (depends on User, Product)
  console.log("🗑️ Deleting favorites...");
  await prisma.favorite.deleteMany();

  // 5. Delete Invite (depends on User, Company)
  console.log("🗑️ Deleting invites...");
  await prisma.invite.deleteMany();

  // 6. Delete CartItem (depends on User, Product)
  console.log("🗑️ Deleting cart items...");
  await prisma.cartItem.deleteMany();

  // 7. Delete Product (depends on User, Category)
  console.log("🗑️ Deleting products...");
  await prisma.product.deleteMany();

  // 8. Delete User (depends on Company)
  console.log("🗑️ Deleting users...");
  await prisma.user.deleteMany();

  // 9. Delete MonthlyBudget (depends on Company)
  console.log("🗑️ Deleting monthly budgets...");
  await prisma.monthlyBudget.deleteMany();

  // 10. Delete Category (self-referencing)
  console.log("🗑️ Deleting categories...");
  await prisma.category.deleteMany();

  // 11. Delete Company (no dependencies)
  console.log("🗑️ Deleting companies...");
  await prisma.company.deleteMany();

  console.log("✅ All existing data deleted successfully!");

  // Reset PostgreSQL autoincrement sequences
  console.log("🔄 Resetting autoincrement sequences...");
  await prisma.$executeRaw`ALTER SEQUENCE "Company_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Category_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "CartItem_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Receipt_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Payment_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Favorite_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "MonthlyBudget_id_seq" RESTART WITH 1;`;

  // 1. Insert Company data
  console.log("📦 Seeding companies...");
  const companies = await prisma.company.createMany({
    data: companyMockData,
    skipDuplicates: true,
  });

  // Get the IDs of the created Companies
  const createdCompanies = await prisma.company.findMany();
  const firstCompanyId = createdCompanies[0]?.id;
  const secondCompanyId = createdCompanies[1]?.id;

  if (!firstCompanyId) {
    throw new Error("No company created");
  }

  // 2. Insert User data
  console.log("👥 Seeding users...");
  const hashedUserData = await Promise.all(
    userMockData.map(async (user, index) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
      role: user.role as any, // Cast to Role enum
      companyId: user.companyId === 2 ? secondCompanyId : firstCompanyId,
    })),
  );

  await prisma.user.createMany({
    data: hashedUserData,
    skipDuplicates: true,
  });

  // 3. Insert MonthlyBudget data
  console.log("💰 Seeding monthly budgets...");

  await prisma.monthlyBudget.createMany({
    data: monthlyBudgetMockData.map((budget) => ({
      ...budget,
      companyId: budget.companyId === 1 ? firstCompanyId : secondCompanyId,
    })),
    skipDuplicates: true,
  });

  // 4. Insert Category data
  console.log("🏷️ Seeding categories...");

  // Create Categories individually to establish parentId relationships
  const categories: any[] = [];
  const categoryMap = new Map(); // name -> id mapping

  for (const category of categoryMockData) {
    let parentId = null;

    // If parentId is a number, find the category ID at that index
    if (category.parentId !== null) {
      const parentIndex = category.parentId - 1; // 1-based to 0-based
      if (parentIndex >= 0 && parentIndex < categories.length) {
        parentId = categories[parentIndex].id;
      }
    }

    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        parentId: parentId,
      },
    });

    categories.push(createdCategory);
    categoryMap.set(category.name, createdCategory.id);
  }

  // 5. Insert Product data
  console.log("🍪 Seeding products...");
  await prisma.product.createMany({
    data: productMockData.map((product) => ({
      ...product,
      categoryId: categories[product.categoryId - 1].id, // Map categoryId to the actual created ID
    })),
    skipDuplicates: true,
  });

  // Get the IDs of the created Products
  const createdProducts = await prisma.product.findMany();
  const productIdMap = new Map(); // Original index -> actual ID mapping
  createdProducts.forEach((product, index) => {
    productIdMap.set(index + 1, product.id); // Map using 1-based index
  });

  // 6. Insert CartItem data
  console.log("🛒 Seeding cart items...");
  await prisma.cartItem.createMany({
    data: cartItemMockData.map((cartItem) => ({
      ...cartItem,
      productId: productIdMap.get(cartItem.productId), // Map to the actual created Product ID
    })),
    skipDuplicates: true,
  });

  // 7. Insert Order data
  console.log("📋 Seeding orders...");

  await prisma.order.createMany({
    data: orderMockData.map((order) => ({
      ...order,
      companyId: order.companyId === 1 ? firstCompanyId : secondCompanyId,
      status: order.status as any,
      deliveryFee: order.deliveryFee,
      productsPriceTotal: order.productsPriceTotal,
    })),
    skipDuplicates: true,
  });

  // Get the IDs of the created Orders
  const createdOrders = await prisma.order.findMany();
  const orderIdMap = new Map(); // Original index -> actual ID mapping
  createdOrders.forEach((order, index) => {
    orderIdMap.set(index + 1, order.id); // Map using 1-based index
  });

  // 8. Insert Receipt data
  console.log("🧾 Seeding receipts...");
  await prisma.receipt.createMany({
    data: receiptMockData.map(({ orderIndex, productId, ...receipt }) => ({
      ...receipt,
      productId: productIdMap.get(productId),
      orderId: orderIdMap.get(orderIndex),
    })),
    skipDuplicates: true,
  });

  // 9. Insert Invite data
  console.log("📧 Seeding invites...");
  await prisma.invite.createMany({
    data: inviteMockData.map((invite, index) => ({
      ...invite,
      // Assign invite-2 (index 1) to the second company, the rest to the first.
      companyId: index === 1 ? secondCompanyId : firstCompanyId,
      role: invite.role as any, // Cast to Role enum
    })),
    skipDuplicates: true,
  });

  // 10. Insert Favorite data
  console.log("❤️ Seeding favorites...");
  await prisma.favorite.createMany({
    data: favoriteMockData.map((favorite) => ({
      ...favorite,
      productId: productIdMap.get(favorite.productId), // Map to the actual created Product ID
    })),
    skipDuplicates: true,
  });

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
