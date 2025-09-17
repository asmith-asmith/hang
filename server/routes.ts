import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertActivitySchema, insertUserActivityInterestSchema, insertMatchSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const { category } = req.query;
      let activities;
      
      if (category && typeof category === 'string') {
        activities = await storage.getActivitiesByCategory(category);
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities", error });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activity = await storage.getActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activity", error });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data", error });
    }
  });

  // User activity interests
  app.post("/api/user-activity-interests", async (req, res) => {
    try {
      const interestData = insertUserActivityInterestSchema.parse(req.body);
      const interest = await storage.createUserActivityInterest(interestData);
      res.json(interest);
    } catch (error) {
      res.status(400).json({ message: "Invalid interest data", error });
    }
  });

  app.get("/api/users/:userId/activity-interests", async (req, res) => {
    try {
      const interests = await storage.getUserActivityInterests(req.params.userId);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user interests", error });
    }
  });

  app.get("/api/activities/:activityId/interests", async (req, res) => {
    try {
      const interests = await storage.getActivityInterests(req.params.activityId);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activity interests", error });
    }
  });

  // Match routes
  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data", error });
    }
  });

  app.get("/api/users/:userId/matches", async (req, res) => {
    try {
      const matches = await storage.getUserMatches(req.params.userId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Error fetching matches", error });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const match = await storage.updateMatchStatus(req.params.id, status);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Error updating match", error });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", error });
    }
  });

  app.get("/api/matches/:matchId/messages", async (req, res) => {
    try {
      const messages = await storage.getMatchMessages(req.params.matchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  });

  // Discovery routes
  app.get("/api/users/:userId/potential-matches", async (req, res) => {
    try {
      const potentialMatches = await storage.getPotentialMatches(req.params.userId);
      res.json(potentialMatches);
    } catch (error) {
      res.status(500).json({ message: "Error fetching potential matches", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
