import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, Settings, Bell, MapPin, Plus, Lightbulb } from "lucide-react";
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
      <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen">
        <div className="hero-gradient text-primary-foreground p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-2xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="hero-gradient text-primary-foreground p-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FriendSync</h1>
              <p className="text-sm opacity-90">NYC Activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="w-10 h-10 bg-white/20 glass-effect hover:bg-white/30"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-10 h-10 bg-white/20 glass-effect hover:bg-white/30"
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center mt-3 space-x-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm opacity-90">{user?.location || "Manhattan, NY"}</span>
          <Button variant="link" className="text-sm underline opacity-90 p-0 h-auto text-primary-foreground">
            Change
          </Button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="p-4 bg-muted/30">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              className={`category-chip flex-shrink-0 ${
                selectedCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
              onClick={() => setSelectedCategory(category.name)}
              data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
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

        {/* Activity Proposal Card */}
        <div className="swipe-card bg-accent/5 border-2 border-dashed border-accent/30 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-bold text-lg mb-2">Propose an Activity</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Have a great idea for a meetup? Share it with the community and find like-minded friends!
          </p>
          <Link href="/create-activity">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-create-activity">
              <Lightbulb className="w-4 h-4 mr-2" />
              Create Activity
            </Button>
          </Link>
        </div>
      </div>

      <BottomNavigation />

      {/* Floating Action Button */}
      <Link href="/create-activity">
        <Button
          className="floating-action fixed bottom-20 right-4 w-14 h-14 bg-accent text-accent-foreground rounded-full hover:bg-accent/90"
          data-testid="button-floating-create"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
