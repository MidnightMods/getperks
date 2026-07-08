import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// Users table (from auth)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Discord verification records
export const verifications = mysqlTable("verifications", {
  id: serial("id").primaryKey(),
  discordId: varchar("discordId", { length: 255 }).notNull(),
  discordUsername: varchar("discordUsername", { length: 255 }),
  discordAvatar: text("discordAvatar"),
  guildId: varchar("guildId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed", "expired"]).default("pending").notNull(),
  ipAddress: varchar("ipAddress", { length: 255 }),
  country: varchar("country", { length: 100 }),
  isVpn: boolean("isVpn").default(false),
  captchaToken: varchar("captchaToken", { length: 500 }),
  authCode: varchar("authCode", { length: 500 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  roleGiven: boolean("roleGiven").default(false),
  roleGivenAt: timestamp("roleGivenAt"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

// Guild management
export const guilds = mysqlTable("guilds", {
  id: serial("id").primaryKey(),
  guildId: varchar("guildId", { length: 255 }).notNull().unique(),
  guildName: varchar("guildName", { length: 255 }),
  guildIcon: text("guildIcon"),
  ownerId: varchar("ownerId", { length: 255 }),
  memberCount: int("memberCount").default(0),
  verifiedRoleId: varchar("verifiedRoleId", { length: 255 }),
  verifiedRoleName: varchar("verifiedRoleName", { length: 255 }),
  isActive: boolean("isActive").default(true),
  settings: json("settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = typeof guilds.$inferInsert;

// Tokens management
export const tokens = mysqlTable("tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  refreshToken: text("refreshToken"),
  discordId: varchar("discordId", { length: 255 }).notNull(),
  discordUsername: varchar("discordUsername", { length: 255 }),
  guildId: varchar("guildId", { length: 255 }),
  scopes: text("scopes"),
  expiresAt: timestamp("expiresAt"),
  isRevoked: boolean("isRevoked").default(false),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

// Orders for product purchases
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerDiscord: varchar("customerDiscord", { length: 255 }),
  productName: varchar("productName", { length: 255 }).notNull(),
  productCategory: varchar("productCategory", { length: 100 }),
  quantity: int("quantity").default(1),
  totalAmount: varchar("totalAmount", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentMethod: mysqlEnum("paymentMethod", ["paypal", "upi", "crypto_ltc", "crypto_usdt"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentProof: text("paymentProof"),
  transactionId: varchar("transactionId", { length: 255 }),
  orderStatus: mysqlEnum("orderStatus", ["pending", "processing", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Products catalog
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["discord", "spotify", "youtube", "netflix"]).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  comparePrice: varchar("comparePrice", { length: 50 }),
  image: text("image"),
  icon: text("icon"),
  stockStatus: mysqlEnum("stockStatus", ["in_stock", "low_stock", "out_of_stock"]).default("in_stock").notNull(),
  stockCount: int("stockCount").default(999),
  isActive: boolean("isActive").default(true),
  features: json("features").$type<string[]>(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
