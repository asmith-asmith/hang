import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

const profileFormSchema = insertUserSchema.extend({
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const interestOptions = [
  "Food & Dining",
  "Outdoor Activities",
  "Arts & Culture",
  "Fitness & Sports",
  "Nightlife",
  "Photography",
  "Music",
  "Travel",
  "Technology",
  "Books"
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string>(user?.photoUrl || "");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      age: user?.age || 25,
      bio: user?.bio || "",
      location: user?.location || "Manhattan, NY",
      interests: user?.interests || [],
      photoUrl: user?.photoUrl || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PATCH", `/api/users/${user!.id}`, {
        ...data,
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleSkip = () => {
    setLocation("/");
  };

  return (
    <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-6 w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground text-sm">Help us find your perfect activity matches</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Photo */}
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center cursor-pointer hover:bg-muted/80 overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  const name = form.getValues("name") || "user";
                  setPhotoUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`);
                }}
                data-testid="button-add-photo"
              >
                Generate Avatar
              </Button>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Age"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-age"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Brief bio (optional)"
                        rows={3}
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interests Selection */}
            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Select Your Interests</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map((interest) => (
                      <FormField
                        key={interest}
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(interest)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), interest]
                                    : (field.value || []).filter((value) => value !== interest);
                                  field.onChange(updatedValue);
                                }}
                                data-testid={`checkbox-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {interest}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSkip}
                data-testid="button-skip"
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
