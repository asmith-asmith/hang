import { Heart, X, Star, Calendar, Users, MapPin } from "lucide-react";
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
  onPass,
}: ActivityCardProps) {
  return (
    <div className="swipe-card activity-card rounded-2xl overflow-hidden shadow-md border border-border bg-card">
      {/* Image with overlay */}
      <div className="relative">
        <img
          src={activity.imageUrl}
          alt={activity.title}
          className="w-full h-52 object-cover"
        />
        {/* Top overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-700 bg-white/90 backdrop-blur-sm text-foreground shadow-sm">
            {activity.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold glass-effect text-white shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {activity.rating}
          </span>
        </div>
        {/* Price at bottom-left of image */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full text-sm font-bold btn-gradient">
            {activity.price}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg leading-tight" data-testid="activity-title">
            {activity.title}
          </h3>
          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5" data-testid="activity-location">
            <MapPin className="w-3.5 h-3.5" />
            {activity.neighborhood}
          </p>
        </div>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed" data-testid="activity-description">
          {activity.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1" data-testid="activity-datetime">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {activity.dateTime}
          </span>
          <span className="flex items-center gap-1" data-testid="activity-interested-count">
            <Users className="w-3.5 h-3.5 text-secondary" />
            {interestedUsers.length} going
          </span>
        </div>

        {/* Footer: avatars + actions */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {interestedUsers.slice(0, 3).map((user, index) => (
              <img
                key={user.id}
                src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-7 h-7 rounded-full border-2 border-background object-cover"
                data-testid={`interested-user-${index}`}
              />
            ))}
            {interestedUsers.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                +{interestedUsers.length - 3}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onPass}
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all duration-200"
              data-testid="button-pass-activity"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={onInterested}
              className="btn-gradient flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm"
              data-testid="button-interested-activity"
            >
              <Heart className="w-3.5 h-3.5" />
              Interested
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
