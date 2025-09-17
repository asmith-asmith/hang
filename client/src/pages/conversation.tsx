import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match, User, Message } from "@shared/schema";

export default function Conversation() {
  const { matchId } = useParams();
  const [currentUserId] = useState("user-1");
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const { data: match } = useQuery<Match>({
    queryKey: ["/api/matches", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`);
      if (!res.ok) throw new Error("Match not found");
      return res.json();
    },
    enabled: !!matchId
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/matches", matchId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}/messages`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!matchId
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!matchId) throw new Error("No match ID");
      return apiRequest("POST", "/api/messages", {
        matchId,
        senderId: currentUserId,
        content
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const otherUser = match && users.find(user => {
    const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
    return user.id === otherUserId;
  });

  if (!matchId) {
    return (
      <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid conversation</p>
      </div>
    );
  }

  if (messagesLoading || !otherUser) {
    return (
      <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen">
        <div className="animate-pulse">
          <div className="h-16 bg-muted border-b"></div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-xs">
                  <div className="h-8 bg-muted rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center space-x-3 p-4 border-b border-border">
        <Link href="/messages">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <img
          src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full object-cover"
          data-testid="conversation-user-photo"
        />
        <div className="flex-1">
          <h2 className="font-semibold" data-testid="conversation-user-name">
            {otherUser.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {otherUser.location}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">
              Start a conversation with {otherUser.name}!
            </p>
            <p className="text-xs text-muted-foreground">
              You matched through a shared activity interest
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`message-${message.id}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
