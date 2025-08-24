import { pgTable, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  points: integer('points').default(0).notNull(),
  joinDate: timestamp('join_date').defaultNow().notNull(),
  lastCheckIn: timestamp('last_check_in'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Points history table
export const pointsHistory = pgTable('points_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  points: integer('points').notNull(),
  reason: text('reason').notNull(),
  type: text('type').notNull(), // 'earned' or 'redeemed'
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Redemptions table
export const redemptions = pgTable('redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  rewardId: text('reward_id').notNull(),
  rewardName: text('reward_name').notNull(),
  pointsCost: integer('points_cost').notNull(),
  status: text('status').default('completed').notNull(), // 'completed', 'pending', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Check-ins table (to track daily check-ins)
export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  checkInDate: timestamp('check_in_date').defaultNow().notNull(),
  pointsEarned: integer('points_earned').notNull(),
  location: text('location'), // Optional: track check-in location
  createdAt: timestamp('created_at').defaultNow().notNull()
})
