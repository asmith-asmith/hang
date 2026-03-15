import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import type { Match, User, Message } from "@shared/schema";

export default function Messages() {
  const { user } = useAuth();
  const currentUserId = user!.id;

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/users", currentUserId, "matches"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${currentUserId}/matches`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    }
  });

  const acceptedMatches = matches.filter(match => match.status === "accepted");

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen">
        <div className="animate-pulse">
          <div className="h-16 bg-muted"></div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
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
        <h2 className="font-bold text-lg">Messages</h2>
        <Button variant="ghost" size="sm" data-testid="button-search">
          <Search className="w-4 h-4" />
        </Button>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {acceptedMatches.length > 0 ? (
          acceptedMatches.map((match) => (
            <MessageThread key={match.id} match={match} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connect with people through activities to start messaging!
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

function MessageThread({ match, currentUserId }: { match: Match; currentUserId: string }) {
  const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;

  const { data: otherUser } = useQuery<User>({
    queryKey: ["/api/users", otherUserId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${otherUserId}`, { credentials: "include" });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/matches", match.id, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${match.id}/messages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (!otherUser) return null;

  const lastMessage = messages[messages.length - 1];

  return (
    <Link href={`/conversation/${match.id}`}>
      <div className="p-4 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors">
        <div className="flex items-start space-x-3">
          <img
            src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm">
                {otherUser.name}
              </h3>
              {lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage?.content || "Start a conversation..."}
            </p>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                Connected via activity
              </span>
            </div>
          </div>
          {!lastMessage && (
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          )}
        </div>
      </div>
    </Link>
  );
}
