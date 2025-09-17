import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertActivitySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const createActivityFormSchema = insertActivitySchema.extend({
  imageUrl: z.string().url("Please enter a valid image URL"),
});

type CreateActivityFormData = z.infer<typeof createActivityFormSchema>;

const categories = [
  "Food & Dining",
  "Outdoor",
  "Arts & Culture", 
  "Fitness & Sports",
  "Nightlife"
];

const neighborhoods = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
  "DUMBO",
  "SoHo",
  "East Village",
  "West Village",
  "Williamsburg",
  "Upper West Side",
  "Upper East Side",
  "Chinatown",
  "Lower East Side"
];

export default function CreateActivity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      imageUrl: "",
      price: "Free",
      dateTime: "",
      maxParticipants: 10,
      neighborhood: "",
      createdByUserId: "user-1", // In a real app, this would come from auth
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: CreateActivityFormData) => {
      return apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      toast({
        title: "Activity created!",
        description: "Your activity is now visible to other users. Start connecting!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateActivityFormData) => {
    createActivityMutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto bg-card shadow-2xl min-h-screen">
      {/* Header */}
      <header className="flex items-center space-x-3 p-4 border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          <h2 className="font-bold text-lg">Create Activity</h2>
        </div>
      </header>

      <div className="p-4">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            Share your activity idea with the community and find like-minded people to join!
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Central Park Picnic" 
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your activity and what people can expect..."
                      rows={3}
                      className="resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neighborhood</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-neighborhood">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Brooklyn Bridge Park, Pier 1"
                      {...field}
                      data-testid="input-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Saturday 2PM"
                        {...field}
                        data-testid="input-datetime"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Free or $20"
                        {...field}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Participants</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="2"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-max-participants"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      data-testid="input-image-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={createActivityMutation.isPending}
                data-testid="button-create-activity"
              >
                {createActivityMutation.isPending ? "Creating..." : "Create Activity"}
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="w-full" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
