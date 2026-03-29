import { MessageCircle, X, Sparkles, MapPin } from "lucide-react";
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
  onPass,
}: UserMatchCardProps) {
  return (
    <div className="swipe-card bg-card rounded-2xl overflow-hidden shadow-md border border-border">
      {/* Header with gradient orb bg */}
      <div className="relative hero-gradient p-5 text-center overflow-hidden">
        {/* Decorative orbs */}
        <div className="bg-orb bg-orb-secondary w-32 h-32 -top-8 -right-8 opacity-60" style={{ position: 'absolute' }} />
        <div className="bg-orb bg-orb-primary w-24 h-24 -bottom-6 -left-6 opacity-50" style={{ position: 'absolute' }} />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass-effect text-white mb-3">
            <Sparkles className="w-3 h-3" />
            Perfect Match
          </span>

          <div className="relative inline-block">
            <img
              src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={`${user.name} profile photo`}
              className="w-20 h-20 rounded-2xl mx-auto object-cover border-3 border-white/30 shadow-xl"
              data-testid="user-photo"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white" />
          </div>

          <h3 className="font-bold text-xl text-white mt-3 leading-tight" data-testid="user-name">
            {user.name}<span className="font-normal opacity-80">, {user.age}</span>
          </h3>
          <p className="text-white/70 text-sm flex items-center justify-center gap-1 mt-0.5" data-testid="user-location">
            <MapPin className="w-3.5 h-3.5" />
            {user.location}
          </p>
        </div>
      </div>

      <div className="p-4">
        {sharedInterests.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Shared Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sharedInterests.map((interest, index) => (
                <span
                  key={index}
                  className="interest-tag px-2.5 py-1 rounded-full text-xs"
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
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              About
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="user-bio">
              {user.bio}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-1">
          <button
            onClick={onPass}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
            data-testid="button-pass-user"
          >
            <X className="w-4 h-4" />
            Pass
          </button>
          <button
            onClick={onConnect}
            className="flex-1 btn-gradient flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm"
            data-testid="button-connect-user"
          >
            <MessageCircle className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
