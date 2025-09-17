import { Heart, X, Star, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Activity } from "@shared/schema";

interface ActivityCardProps {
  activity: Activity;
  interestedUsers?: Array<{ id: string; name: string; photoUrl?: string }>;
  onInterested: () => void;
  onPass: () => void;
}

export default function ActivityCard({ 
  activity, 
  interestedUsers = [], 
  onInterested, 
  onPass 
}: ActivityCardProps) {
  return (
    <div className="swipe-card activity-card rounded-2xl overflow-hidden shadow-lg border border-border">
      <img 
        src={activity.imageUrl} 
        alt={activity.title}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg" data-testid="activity-title">{activity.title}</h3>
            <p className="text-muted-foreground text-sm" data-testid="activity-location">
              {activity.neighborhood}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-accent fill-current" />
            <span className="text-sm font-medium" data-testid="activity-rating">
              {activity.rating}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3" data-testid="activity-description">
          {activity.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span data-testid="activity-datetime">
              <Calendar className="w-4 h-4 inline mr-1" />
              {activity.dateTime}
            </span>
            <span data-testid="activity-interested-count">
              <Users className="w-4 h-4 inline mr-1" />
              {interestedUsers.length} interested
            </span>
          </div>
          <span className="text-sm font-medium text-primary" data-testid="activity-price">
            {activity.price}
          </span>
        </div>
        
        {/* Interested Users */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {interestedUsers.slice(0, 3).map((user, index) => (
              <img
                key={user.id}
                src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-background object-cover"
                data-testid={`interested-user-${index}`}
              />
            ))}
            {interestedUsers.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                +{interestedUsers.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPass}
              data-testid="button-pass-activity"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={onInterested}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              data-testid="button-interested-activity"
            >
              <Heart className="w-4 h-4 mr-2" />
              Interested
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
