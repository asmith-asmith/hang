import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (!name || !age) {
          toast({
            title: "Missing fields",
            description: "Please fill in all fields.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        await register(username, password, name, Number(age));
      }
      setLocation("/");
    } catch (error: any) {
      const message = error?.message?.includes(":")
        ? JSON.parse(error.message.split(": ").slice(1).join(": "))?.message
        : "Something went wrong";
      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col">
      {/* Top gradient banner */}
      <div className="hero-gradient relative overflow-hidden flex-shrink-0 pt-16 pb-12 px-6 text-center">
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'hsl(330 81% 70%)', filter: 'blur(50px)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-15"
          style={{ background: 'hsl(265 89% 80%)', filter: 'blur(40px)', transform: 'translate(-30%, 30%)' }}
        />
        <div className="relative z-10">
          <div className="w-16 h-16 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hang</h1>
          <p className="text-white/70 text-sm mt-1.5 font-medium">
            Meet people through shared activities
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-5 relative z-10">
        <div className="bg-card rounded-3xl shadow-lg border border-border p-6">
          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="rounded-xl border-border bg-muted/50 focus:bg-card transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="rounded-xl border-border bg-muted/50 focus:bg-card transition-colors"
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="rounded-xl border-border bg-muted/50 focus:bg-card transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                    min="18"
                    max="120"
                    required
                    className="rounded-xl border-border bg-muted/50 focus:bg-card transition-colors"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (isLogin ? "Logging in..." : "Creating account...")
                : (
                  <>
                    {isLogin ? "Log In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5 mb-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
