// src/lib/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid
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
  created_at: timestamp("created_at").defaultNow(),
});

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

export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;



