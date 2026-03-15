import { Link, useLocation } from "wouter";
import { Compass, Users, MessageCircle, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Compass, label: "Discover", testId: "nav-discover" },
    { path: "/matches", icon: Users, label: "Matches", testId: "nav-matches" },
    { path: "/messages", icon: MessageCircle, label: "Messages", testId: "nav-messages" },
    { path: "/profile", icon: User, label: "Profile", testId: "nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md glass-effect border-t border-white/20 z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location === path || (path === "/" && location === "/");

          return (
            <Link key={path} href={path}>
              <button
                className="relative flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-200"
                data-testid={testId}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                <span
                  className={`text-xs font-semibold mt-0.5 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
