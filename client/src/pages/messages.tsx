import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Search, MessageCircle, Zap } from "lucide-react";
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
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <div className="h-16 skeleton-shimmer" />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
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
        <h2 className="font-bold text-base">Messages</h2>
        <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all" data-testid="button-search">
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto pb-28">
        {acceptedMatches.length > 0 ? (
          <div>
            <div className="px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                All conversations · {acceptedMatches.length}
              </p>
            </div>
            {acceptedMatches.map((match) => (
              <MessageThread key={match.id} match={match} currentUserId={currentUserId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 rounded-3xl hero-gradient-subtle flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">No conversations yet</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              Connect with people through activities to start chatting!
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
  const hasUnread = !lastMessage;

  return (
    <Link href={`/conversation/${match.id}`}>
      <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 cursor-pointer transition-colors border-b border-border/50">
        <div className="relative flex-shrink-0">
          <img
            src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
            alt={otherUser.name}
            className="w-12 h-12 rounded-2xl object-cover"
          />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className={`text-sm ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
              {otherUser.name}
            </h3>
            {lastMessage && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          <p className={`text-sm truncate ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {lastMessage?.content || "Start a conversation..."}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">Connected via activity</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
