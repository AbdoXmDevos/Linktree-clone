// src/lib/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  jsonb,
  boolean,
  inet,
  varchar
} from "drizzle-orm/pg-core";

// ------------------ User Tables ------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  password: text("password"), // Store hashed passwords
  created_at: timestamp("created_at").defaultNow(),
});

// ------------------ Linktree Tables ------------------
export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  primary_color: text("primary_color").notNull(),
  secondary_color: text("secondary_color").notNull(),
  background_style: text("background_style").notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").notNull().references(() => users.id),
  username: text("username").notNull().unique(),
  display_name: text("display_name"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  theme_id: uuid("theme_id").references(() => themes.id),
  theme: varchar("theme", { length: 10 }).default("light"),
  customization: jsonb("customization").default({}),
  analytics_enabled: boolean("analytics_enabled").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  profile_id: uuid("profile_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  order_index: integer("order_index").default(0),
  icon: text("icon"),
  category: varchar("category", { length: 50 }),
  tags: text("tags").array(),
  custom_styling: jsonb("custom_styling"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Categories table for link organization
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  profile_id: uuid("profile_id").notNull().references(() => profiles.id),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }), // Hex color
  icon: varchar("icon", { length: 50 }),
  order_index: integer("order_index").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

// Enhanced analytics table for tracking clicks and engagement
export const link_analytics = pgTable("link_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  link_id: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  event_type: varchar("event_type", { length: 20 }).notNull(), // 'click', 'view', 'share', 'created'
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  user_agent: text("user_agent"),
  referrer: text("referrer"),
  ip_address: inet("ip_address"),
  country_code: varchar("country_code", { length: 2 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Keep the old analytics table for backward compatibility (can be removed later)
export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  link_id: uuid("link_id").notNull().references(() => links.id),
  clicked_at: timestamp("clicked_at").defaultNow(),
  user_agent: text("user_agent"),
  referrer: text("referrer"),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type LinkAnalytics = typeof link_analytics.$inferSelect;
export type NewLinkAnalytics = typeof link_analytics.$inferInsert;

export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;



