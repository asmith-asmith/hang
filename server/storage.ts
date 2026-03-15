import {
  users,
  activities,
  userActivityInterests,
  matches,
  messages,
  type User,
  type InsertUser,
  type Activity,
  type InsertActivity,
  type UserActivityInterest,
  type InsertUserActivityInterest,
  type Match,
  type InsertMatch,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, or, and, inArray } from "drizzle-orm";
import type { db as DbType } from "./db";

export type CreateUserData = {
  username: string;
  password: string;
  name: string;
  age: number;
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: CreateUserData): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Activity operations
  getActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByCategory(category: string): Promise<Activity[]>;

  // User activity interest operations
  createUserActivityInterest(interest: InsertUserActivityInterest): Promise<UserActivityInterest>;
  getUserActivityInterests(userId: string): Promise<UserActivityInterest[]>;
  getActivityInterests(activityId: string): Promise<UserActivityInterest[]>;

  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  updateMatchStatus(id: string, status: string): Promise<Match | undefined>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMatchMessages(matchId: string): Promise<Message[]>;

  // Discovery operations
  getPotentialMatches(userId: string): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private activities: Map<string, Activity> = new Map();
  private userActivityInterests: Map<string, UserActivityInterest> = new Map();
  private matches: Map<string, Match> = new Map();
  private messages: Map<string, Message> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const nycActivities: InsertActivity[] = [
      {
        title: "Brooklyn Bridge Park Picnic",
        description: "Join fellow food lovers for a scenic picnic with amazing city views. Bring your favorite dishes to share!",
        location: "Brooklyn Bridge Park, DUMBO",
        category: "Food & Dining",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "Free",
        dateTime: "Saturday 2PM",
        maxParticipants: 15,
        neighborhood: "DUMBO, Brooklyn"
      },
      {
        title: "Morning Yoga in Central Park",
        description: "Start your weekend with peaceful yoga surrounded by nature. All skill levels welcome!",
        location: "Central Park, Manhattan",
        category: "Fitness & Sports",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "$15",
        dateTime: "Sunday 9AM",
        maxParticipants: 20,
        neighborhood: "Upper West Side"
      },
      {
        title: "Food Tour in Chinatown",
        description: "Explore authentic flavors and hidden gems in one of NYC's most vibrant neighborhoods.",
        location: "Chinatown, Manhattan",
        category: "Food & Dining",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "$45",
        dateTime: "Saturday 1PM",
        maxParticipants: 12,
        neighborhood: "Chinatown"
      },
      {
        title: "Photography Walk in SoHo",
        description: "Capture the essence of NYC's artistic district with fellow photography enthusiasts.",
        location: "SoHo, Manhattan",
        category: "Arts & Culture",
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "Free",
        dateTime: "Sunday 3PM",
        maxParticipants: 8,
        neighborhood: "SoHo"
      },
      {
        title: "Rooftop Bar Meetup",
        description: "Enjoy cocktails and city views at one of Brooklyn's best rooftop spots.",
        location: "Williamsburg, Brooklyn",
        category: "Nightlife",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "$25",
        dateTime: "Friday 7PM",
        maxParticipants: 25,
        neighborhood: "Williamsburg"
      }
    ];

    nycActivities.forEach(activity => {
      const id = randomUUID();
      this.activities.set(id, {
        ...activity,
        id,
        rating: 5,
        price: activity.price || "Free",
        maxParticipants: activity.maxParticipants || 10,
        createdByUserId: null
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(data: CreateUserData): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: data.username,
      password: data.password,
      name: data.name,
      age: data.age,
      location: "Manhattan, NY",
      interests: [],
      bio: null,
      photoUrl: null,
      isProfileComplete: false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      isProfileComplete: !!(updates.name || user.name) &&
                        !!(updates.age || user.age) &&
                        !!((updates.interests && updates.interests.length > 0) || (user.interests && user.interests.length > 0))
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      rating: 5,
      price: insertActivity.price || "Free",
      maxParticipants: insertActivity.maxParticipants || 10,
      createdByUserId: insertActivity.createdByUserId || null
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivitiesByCategory(category: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => activity.category === category);
  }

  async createUserActivityInterest(insertInterest: InsertUserActivityInterest): Promise<UserActivityInterest> {
    const id = randomUUID();
    const interest: UserActivityInterest = {
      ...insertInterest,
      id,
      isInterested: insertInterest.isInterested ?? true
    };
    this.userActivityInterests.set(id, interest);
    return interest;
  }

  async getUserActivityInterests(userId: string): Promise<UserActivityInterest[]> {
    return Array.from(this.userActivityInterests.values()).filter(interest => interest.userId === userId);
  }

  async getActivityInterests(activityId: string): Promise<UserActivityInterest[]> {
    return Array.from(this.userActivityInterests.values()).filter(interest => interest.activityId === activityId);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = {
      ...insertMatch,
      id,
      status: "pending",
      activityId: insertMatch.activityId || null
    };
    this.matches.set(id, match);
    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match =>
      match.user1Id === userId || match.user2Id === userId
    );
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async updateMatchStatus(id: string, status: string): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;

    const updatedMatch: Match = { ...match, status };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date().toISOString()
    };
    this.messages.set(id, message);
    return message;
  }

  async getMatchMessages(matchId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.matchId === matchId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getPotentialMatches(userId: string): Promise<User[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    const userInterests = await this.getUserActivityInterests(userId);
    const userActivityIds = userInterests.map(interest => interest.activityId);

    const potentialMatches: User[] = [];
    for (const [otherUserId, otherUser] of Array.from(this.users.entries())) {
      if (otherUserId === userId) continue;

      const otherUserInterests = await this.getUserActivityInterests(otherUserId);
      const otherUserActivityIds = otherUserInterests.map(interest => interest.activityId);

      const sharedActivities = userActivityIds.filter(activityId =>
        otherUserActivityIds.includes(activityId)
      );

      if (sharedActivities.length > 0) {
        potentialMatches.push(otherUser);
      }
    }

    return potentialMatches;
  }
}

export class DatabaseStorage implements IStorage {
  constructor(private db: typeof DbType) {}

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.name, username));
    return user;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const [user] = await this.db.insert(users).values({
      username: data.username,
      password: data.password,
      name: data.name,
      age: data.age,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existing = await this.getUser(id);
    if (!existing) return undefined;

    const isProfileComplete = !!(updates.name || existing.name) &&
      !!(updates.age || existing.age) &&
      !!((updates.interests && updates.interests.length > 0) || (existing.interests && existing.interests.length > 0));

    const [user] = await this.db.update(users)
      .set({ ...updates, isProfileComplete })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getActivities(): Promise<Activity[]> {
    return this.db.select().from(activities);
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    const [activity] = await this.db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await this.db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getActivitiesByCategory(category: string): Promise<Activity[]> {
    return this.db.select().from(activities).where(eq(activities.category, category));
  }

  async createUserActivityInterest(insertInterest: InsertUserActivityInterest): Promise<UserActivityInterest> {
    const [interest] = await this.db.insert(userActivityInterests).values(insertInterest).returning();
    return interest;
  }

  async getUserActivityInterests(userId: string): Promise<UserActivityInterest[]> {
    return this.db.select().from(userActivityInterests).where(eq(userActivityInterests.userId, userId));
  }

  async getActivityInterests(activityId: string): Promise<UserActivityInterest[]> {
    return this.db.select().from(userActivityInterests).where(eq(userActivityInterests.activityId, activityId));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await this.db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return this.db.select().from(matches).where(
      or(eq(matches.user1Id, userId), eq(matches.user2Id, userId))
    );
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await this.db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async updateMatchStatus(id: string, status: string): Promise<Match | undefined> {
    const [match] = await this.db.update(matches)
      .set({ status })
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await this.db.insert(messages).values({
      ...insertMessage,
      timestamp: new Date().toISOString(),
    }).returning();
    return message;
  }

  async getMatchMessages(matchId: string): Promise<Message[]> {
    return this.db.select().from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.timestamp);
  }

  async getPotentialMatches(userId: string): Promise<User[]> {
    const userInterests = await this.getUserActivityInterests(userId);
    const userActivityIds = userInterests.map(i => i.activityId);

    if (userActivityIds.length === 0) return [];

    // Find other users interested in the same activities
    const otherInterests = await this.db.select()
      .from(userActivityInterests)
      .where(
        and(
          inArray(userActivityInterests.activityId, userActivityIds),
          // Exclude the current user's own interests
          eq(userActivityInterests.isInterested, true)
        )
      );

    const otherUserIds = [...new Set(
      otherInterests
        .map(i => i.userId)
        .filter(id => id !== userId)
    )];

    if (otherUserIds.length === 0) return [];

    return this.db.select().from(users).where(inArray(users.id, otherUserIds));
  }
}

// Use DatabaseStorage when DATABASE_URL is available, otherwise fall back to MemStorage
let storageInstance: IStorage;
if (process.env.DATABASE_URL) {
  const { db } = await import("./db");
  storageInstance = new DatabaseStorage(db);
} else {
  storageInstance = new MemStorage();
}
export const storage: IStorage = storageInstance;
