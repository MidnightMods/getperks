import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, products } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export const orderRouter = createRouter({
  // Get all products
  products: publicQuery.query(async () => {
    const db = getDb();
    const all = await db
      .select()
      .from(products)
      .orderBy(products.sortOrder);
    return all;
  }),

  // Create an order
  create: publicQuery
    .input(
      z.object({
        customerName: z.string().optional(),
        customerEmail: z.string().email().optional(),
        customerDiscord: z.string().optional(),
        productName: z.string(),
        productCategory: z.string(),
        quantity: z.number().default(1),
        totalAmount: z.string(),
        currency: z.string().default("USD"),
        paymentMethod: z.enum(["paypal", "upi", "crypto_ltc", "crypto_usdt"]),
        paymentProof: z.string().optional(),
        transactionId: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const orderNumber = `PERKS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const result = await db.insert(orders).values({
        orderNumber,
        ...input,
      });

      return { success: true, orderNumber, id: Number(result[0].insertId) };
    }),

  // Get order by number
  getByNumber: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const records = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);
      return records[0] || null;
    }),

  // List all orders
  list: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return all;
  }),

  // Update order status
  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        paymentStatus: z
          .enum(["pending", "completed", "failed", "refunded"])
          .optional(),
        orderStatus: z
          .enum(["pending", "processing", "completed", "cancelled"])
          .optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(orders).set(updates).where(eq(orders.id, id));
      return { success: true };
    }),

  // Seed default products
  seedProducts: publicQuery.mutation(async () => {
    const db = getDb();

    const defaultProducts = [
      {
        name: "Discord Nitro Basic 1 Month",
        description: "Gift link for Discord Nitro Basic - 1 month subscription",
        category: "discord" as const,
        price: "2.50",
        comparePrice: "4.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Custom emoji anywhere", "Nitro badge", "Personalized profile"],
        sortOrder: 1,
      },
      {
        name: "Discord Nitro Classic 1 Month",
        description: "Gift link for Discord Nitro Classic - 1 month subscription",
        category: "discord" as const,
        price: "6.00",
        comparePrice: "9.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Custom emoji anywhere", "Nitro badge", "Animated avatar", "Server boosts"],
        sortOrder: 2,
      },
      {
        name: "Discord Server Boost 14x",
        description: "14x Server Boosts for your Discord server",
        category: "discord" as const,
        price: "7.00",
        comparePrice: "13.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Level up your server", "Unlock perks", "Custom server URL"],
        sortOrder: 3,
      },
      {
        name: "Discord Account with Nitro Basic",
        description: "Fresh Discord account with 1 month Nitro Basic",
        category: "discord" as const,
        price: "2.00",
        comparePrice: "4.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Ready to use", "Nitro included", "Email verified"],
        sortOrder: 4,
      },
      {
        name: "Spotify Premium 2 Months",
        description: "Spotify Premium account - 2 months",
        category: "spotify" as const,
        price: "3.00",
        comparePrice: "9.98",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Ad-free music", "Offline listening", "High quality audio"],
        sortOrder: 5,
      },
      {
        name: "Spotify Premium 3 Months",
        description: "Spotify Premium account - 3 months",
        category: "spotify" as const,
        price: "5.00",
        comparePrice: "14.97",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Ad-free music", "Offline listening", "High quality audio"],
        sortOrder: 6,
      },
      {
        name: "Spotify Premium 1 Year",
        description: "Spotify Premium account - 1 year",
        category: "spotify" as const,
        price: "10.00",
        comparePrice: "59.88",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Ad-free music", "Offline listening", "High quality audio", "Best value"],
        sortOrder: 7,
      },
      {
        name: "YouTube Premium 1 Month",
        description: "YouTube Premium on your personal email - 1 month",
        category: "youtube" as const,
        price: "1.00",
        comparePrice: "11.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Ad-free videos", "Background play", "Download videos"],
        sortOrder: 8,
      },
      {
        name: "YouTube Premium Family 1 Month",
        description: "YouTube Premium Family plan - 1 month",
        category: "youtube" as const,
        price: "2.00",
        comparePrice: "17.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["Up to 5 family members", "Ad-free", "Background play"],
        sortOrder: 9,
      },
      {
        name: "Netflix 4K Lifetime Keys 1 Year",
        description: "Netflix 4K UHD Quality Keys - 1 year",
        category: "netflix" as const,
        price: "8.00",
        comparePrice: "19.99",
        stockStatus: "in_stock" as const,
        stockCount: 999,
        features: ["4K Ultra HD", "Multiple profiles", "Works on all devices"],
        sortOrder: 10,
      },
    ];

    // Insert if not exists
    for (const product of defaultProducts) {
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.name, product.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(products).values(product);
      }
    }

    return { success: true, count: defaultProducts.length };
  }),
});
