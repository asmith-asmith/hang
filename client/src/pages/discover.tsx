import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Settings, Bell, MapPin, Plus, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/activity-card";
import UserMatchCard from "@/components/user-match-card";
import BottomNavigation from "@/components/bottom-navigation";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Activity, User } from "@shared/schema";

export default function Discover() {
  const [selectedCategory, setSelectedCategory] = useState("Food & Dining");
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = [
    { name: "Food & Dining", icon: "🍽️" },
    { name: "Outdoor", icon: "🌳" },
    { name: "Arts & Culture", icon: "🎨" },
    { name: "Fitness & Sports", icon: "💪" },
    { name: "Nightlife", icon: "🍸" },
  ];

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    }
  });

  const { data: potentialMatches = [] } = useQuery<User[]>({
    queryKey: ["/api/users", user!.id, "potential-matches"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${user!.id}/potential-matches`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    }
  });

  const interestMutation = useMutation({
    mutationFn: async (activityId: string) => {
      return apiRequest("POST", "/api/user-activity-interests", {
        activityId,
        isInterested: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Interest recorded!",
        description: "We'll help you find friends with similar interests.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user!.id, "potential-matches"] });
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", "/api/matches", {
        user2Id: userId
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection request sent!",
        description: "You'll be notified if they're interested too.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user!.id, "matches"] });
    }
  });

  const filteredActivities = activities.filter(activity =>
    selectedCategory === "Food & Dining" ?
      activity.category === "Food & Dining" :
      activity.category === selectedCategory
  );

  if (activitiesLoading) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Skeleton header */}
        <div className="hero-gradient p-5 pb-6">
          <div className="animate-pulse space-y-2">
            <div className="h-7 bg-white/20 rounded-xl w-1/2" />
            <div className="h-4 bg-white/15 rounded-lg w-3/4" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer rounded-2xl h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative">
      {/* ── Header ── */}
      <header className="hero-gradient relative overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'hsl(330 81% 70%)', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15"
          style={{ background: 'hsl(265 89% 80%)', filter: 'blur(32px)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative z-10 p-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">Hang</h1>
                <p className="text-white/70 text-xs font-medium">NYC Activities</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="w-9 h-9 glass-effect rounded-xl flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 glass-effect rounded-xl flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center mt-3 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-white/70" />
            <span className="text-white/80 text-sm font-medium">{user?.location || "Manhattan, NY"}</span>
            <button className="text-white/60 text-xs underline underline-offset-2 ml-1 hover:text-white/90 transition-colors">
              Change
            </button>
          </div>
        </div>
      </header>

      {/* ── Category Filter ── */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {categories.map((category) => {
            const isActive = selectedCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`category-chip flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "category-chip-active"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
                data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-4 pb-28">
        {/* Activity Cards */}
        {filteredActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            interestedUsers={[]}
            onInterested={() => interestMutation.mutate(activity.id)}
            onPass={() => {
              toast({
                title: "Activity passed",
                description: "We'll show you more options.",
              });
            }}
          />
        ))}

        {/* User Match Cards */}
        {potentialMatches.slice(0, 2).map((matchUser) => (
          <UserMatchCard
            key={matchUser.id}
            user={matchUser}
            sharedInterests={matchUser.interests?.slice(0, 4) || []}
            onConnect={() => connectMutation.mutate(matchUser.id)}
            onPass={() => {
              toast({
                title: "User passed",
                description: "We'll find other potential matches.",
              });
            }}
          />
        ))}

        {/* Propose Activity CTA */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 text-center">
          <div className="w-14 h-14 btn-gradient rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-base mb-1">Propose an Activity</h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Have a great idea for a meetup? Share it with the community!
          </p>
          <Link href="/create-activity">
            <button
              className="btn-gradient inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              data-testid="button-create-activity"
            >
              <Lightbulb className="w-4 h-4" />
              Create Activity
            </button>
          </Link>
        </div>
      </div>

      <BottomNavigation />

      {/* ── Floating Action Button ── */}
      <Link href="/create-activity">
        <button
          className="floating-action fixed bottom-20 right-4 w-13 h-13 w-14 h-14 rounded-2xl flex items-center justify-center text-white"
          data-testid="button-floating-create"
        >
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
