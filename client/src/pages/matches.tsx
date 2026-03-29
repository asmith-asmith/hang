import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Match, User } from "@shared/schema";

export default function Matches() {
  const { user } = useAuth();
  const currentUserId = user!.id;
  const { toast } = useToast();

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/users", currentUserId, "matches"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${currentUserId}/matches`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch matches");
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
      toast({ title: "Match accepted!", description: "You can now start messaging." });
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
      toast({ title: "Match declined", description: "No worries, we'll find you more matches!" });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "matches"] });
    }
  });

  const getOtherUserId = (match: Match): string =>
    match.user1Id === currentUserId ? match.user2Id : match.user1Id;

  const pendingMatches = matches.filter(match => match.status === "pending");
  const acceptedMatches = matches.filter(match => match.status === "accepted");

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <div className="p-4">
          <div className="h-6 skeleton-shimmer rounded-xl mb-6 w-1/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 skeleton-shimmer rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton-shimmer rounded-lg w-3/4" />
                <div className="h-3 skeleton-shimmer rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/">
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <h2 className="font-bold text-base">Matches</h2>
        <div className="w-9" />
      </header>

      <div className="p-4 pb-28 space-y-6">
        {/* Pending Matches */}
        {pendingMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                New Matches · {pendingMatches.length}
              </h3>
            </div>
            <div className="space-y-3">
              {pendingMatches.map((match) => (
                <MatchUserCard
                  key={match.id}
                  userId={getOtherUserId(match)}
                  match={match}
                  onAccept={() => acceptMatchMutation.mutate(match.id)}
                  onReject={() => rejectMatchMutation.mutate(match.id)}
                  isPending
                  acceptDisabled={acceptMatchMutation.isPending}
                  rejectDisabled={rejectMatchMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accepted Matches */}
        {acceptedMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Connected · {acceptedMatches.length}
              </h3>
            </div>
            <div className="space-y-3">
              {acceptedMatches.map((match) => (
                <MatchUserCard
                  key={match.id}
                  userId={getOtherUserId(match)}
                  match={match}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl hero-gradient-subtle flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">No matches yet</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              Show interest in activities to find people with similar vibes!
            </p>
            <Link href="/">
              <button className="btn-gradient px-6 py-2.5 rounded-xl text-sm" data-testid="button-find-activities">
                Find Activities
              </button>
            </Link>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

function MatchUserCard({
  userId,
  match,
  onAccept,
  onReject,
  isPending,
  acceptDisabled,
  rejectDisabled,
}: {
  userId: string;
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
  isPending?: boolean;
  acceptDisabled?: boolean;
  rejectDisabled?: boolean;
}) {
  const { data: otherUser } = useQuery<User>({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
  });

  if (!otherUser) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
          alt={otherUser.name}
          className="w-12 h-12 rounded-2xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">
            {otherUser.name}<span className="font-normal text-muted-foreground">, {otherUser.age}</span>
          </h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {otherUser.location}
          </p>
        </div>
        {!isPending && (
          <Link href={`/conversation/${match.id}`}>
            <button className="btn-gradient flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              Message
            </button>
          </Link>
        )}
      </div>

      {otherUser.bio && (
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {otherUser.bio}
        </p>
      )}

      {isPending && onAccept && onReject && (
        <div className="flex gap-2 mt-1">
          <button
            className="flex-1 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 disabled:opacity-50"
            onClick={onReject}
            disabled={rejectDisabled}
          >
            Decline
          </button>
          <button
            className="flex-1 btn-gradient py-2 rounded-xl text-sm disabled:opacity-50"
            onClick={onAccept}
            disabled={acceptDisabled}
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}
