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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location === path || (path === "/" && location === "/");
          
          return (
            <Link key={path} href={path}>
              <button 
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                data-testid={testId}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
