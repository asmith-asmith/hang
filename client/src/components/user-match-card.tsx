import { MessageCircle, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface UserMatchCardProps {
  user: User;
  sharedInterests?: string[];
  onConnect: () => void;
  onPass: () => void;
}

export default function UserMatchCard({ 
  user, 
  sharedInterests = [], 
  onConnect, 
  onPass 
}: UserMatchCardProps) {
  return (
    <div className="swipe-card bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
      <div className="bg-secondary/10 p-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-4">
          <Users className="w-4 h-4" />
          <span>Perfect Match</span>
        </div>
        <img 
          src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={`${user.name} profile photo`}
          className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-background shadow-lg"
          data-testid="user-photo"
        />
        
        <h3 className="font-bold text-lg mt-3" data-testid="user-name">
          {user.name}, {user.age}
        </h3>
        <p className="text-muted-foreground text-sm" data-testid="user-location">
          {user.location}
        </p>
      </div>
      
      <div className="p-4">
        {sharedInterests.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Shared Interests</h4>
            <div className="flex flex-wrap gap-2">
              {sharedInterests.map((interest, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  data-testid={`shared-interest-${index}`}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {user.bio && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">About</h4>
            <p className="text-sm text-muted-foreground" data-testid="user-bio">
              {user.bio}
            </p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onPass}
            data-testid="button-pass-user"
          >
            <X className="w-4 h-4 mr-2" />
            Pass
          </Button>
          <Button
            className="flex-1"
            onClick={onConnect}
            data-testid="button-connect-user"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}
