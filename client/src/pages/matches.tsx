import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match, User } from "@shared/schema";

export default function Matches() {
  const [currentUserId] = useState("user-1");
  const { toast } = useToast();

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/users", currentUserId, "matches"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${currentUserId}/matches`);
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    }
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const acceptMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest("PATCH", `/api/matches/${matchId}`, {
        status: "accepted"
      });
    },
    onSuccess: () => {
      toast({
        title: "Match accepted!",
        description: "You can now start messaging.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "matches"] });
    }
  });

  const rejectMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest("PATCH", `/api/matches/${matchId}`, {
        status: "rejected"
      });
    },
    onSuccess: () => {
      toast({
        title: "Match declined",
        description: "No worries, we'll find you more matches!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "matches"] });
    }
  });

  const getOtherUser = (match: Match): User | undefined => {
    const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
    return users.find(user => user.id === otherUserId);
  };

  const pendingMatches = matches.filter(match => match.status === "pending");
  const acceptedMatches = matches.filter(match => match.status === "accepted");

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-muted rounded mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen relative">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="font-bold text-lg">Matches</h2>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="p-4 pb-24">
        {/* Pending Matches */}
        {pendingMatches.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-muted-foreground">New Matches</h3>
            <div className="space-y-3">
              {pendingMatches.map((match) => {
                const otherUser = getOtherUser(match);
                if (!otherUser) return null;

                return (
                  <div key={match.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid={`match-user-photo-${match.id}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`match-user-name-${match.id}`}>
                          {otherUser.name}, {otherUser.age}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {otherUser.location}
                        </p>
                      </div>
                    </div>

                    {otherUser.bio && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {otherUser.bio}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => rejectMatchMutation.mutate(match.id)}
                        disabled={rejectMatchMutation.isPending}
                        data-testid={`button-reject-${match.id}`}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => acceptMatchMutation.mutate(match.id)}
                        disabled={acceptMatchMutation.isPending}
                        data-testid={`button-accept-${match.id}`}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accepted Matches */}
        {acceptedMatches.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Connected Friends</h3>
            <div className="space-y-3">
              {acceptedMatches.map((match) => {
                const otherUser = getOtherUser(match);
                if (!otherUser) return null;

                return (
                  <div key={match.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid={`connected-user-photo-${match.id}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`connected-user-name-${match.id}`}>
                          {otherUser.name}, {otherUser.age}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {otherUser.location}
                        </p>
                      </div>
                      <Link href={`/conversation/${match.id}`}>
                        <Button size="sm" data-testid={`button-message-${match.id}`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No matches yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Show interest in activities to find people with similar interests!
            </p>
            <Link href="/">
              <Button data-testid="button-find-activities">
                Find Activities
              </Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
