import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  location: text("location").notNull().default("Manhattan, NY"),
  interests: text("interests").array().notNull().default(sql`ARRAY[]::text[]`),
  isProfileComplete: boolean("is_profile_complete").notNull().default(false),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  price: text("price").notNull().default("Free"),
  dateTime: text("date_time").notNull(),
  maxParticipants: integer("max_participants").notNull().default(10),
  createdByUserId: varchar("created_by_user_id").references(() => users.id),
  rating: integer("rating").notNull().default(5),
  neighborhood: text("neighborhood").notNull(),
});

export const userActivityInterests = pgTable("user_activity_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityId: varchar("activity_id").notNull().references(() => activities.id),
  isInterested: boolean("is_interested").notNull().default(true),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  activityId: varchar("activity_id").references(() => activities.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isProfileComplete: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  rating: true,
});

export const insertUserActivityInterestSchema = createInsertSchema(userActivityInterests).omit({
  id: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  status: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertUserActivityInterest = z.infer<typeof insertUserActivityInterestSchema>;
export type UserActivityInterest = typeof userActivityInterests.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
