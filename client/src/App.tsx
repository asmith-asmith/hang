import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Discover from "@/pages/discover";
import ProfileSetup from "@/pages/profile-setup";
import Matches from "@/pages/matches";
import Messages from "@/pages/messages";
import Conversation from "@/pages/conversation";
import CreateActivity from "@/pages/create-activity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/matches" component={Matches} />
      <Route path="/messages" component={Messages} />
      <Route path="/conversation/:matchId" component={Conversation} />
      <Route path="/create-activity" component={CreateActivity} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
