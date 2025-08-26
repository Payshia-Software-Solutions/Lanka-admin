
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Activity } from "@/lib/types";

export default function EditActivityPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    if (!activityId) return;

    const fetchActivity = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch(`http://localhost/travel_web_server/activities/${activityId}`);
        if (response.ok) {
          const data = await response.json();
          setActivity(data);
        } else {
          setActivity(null);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch activity data.",
          });
        }
      } catch (error) {
        console.error("Error fetching activity data:", error);
        setActivity(null);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching activity data.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchActivity();
  }, [activityId, toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImage(event.target.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (activity) {
      setActivity({
        ...activity,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activity) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Method override for PHP
    formData.append('name', activity.name);
    formData.append('description', activity.description);
    formData.append('location', activity.location);
    formData.append('duration', activity.duration.toString());
    formData.append('company_id', activity.company_id.toString());

    if (newImage) {
      formData.append('image', newImage);
    }
    
    try {
      const response = await fetch(`http://localhost/travel_web_server/activities/${activityId}`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Activity Updated!",
          description: `Successfully updated "${responseData.activity?.name}".`,
        });
        router.push("/admin/activities");
        router.refresh(); 
      } else {
        throw new Error(responseData.error || 'Failed to update activity.');
      }
    } catch (error) {
      console.error("Activity update error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading activity...</p>
      </div>
    );
  }
  
  if (!activity) {
      return (
          <div className="space-y-6 text-center">
              <h1 className="text-2xl font-bold text-destructive">Activity Not Found</h1>
              <p className="text-muted-foreground">The activity with ID "{activityId}" could not be found.</p>
              <Button onClick={() => router.push("/admin/activities")}>Back to Activities</Button>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Edit Activity</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Details for: {activity?.name}</CardTitle>
          <CardDescription>Update the details for this activity.</CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Activity Name</Label>
                    <Input
                    id="name"
                    name="name"
                    value={activity.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                    id="location"
                    name="location"
                    value={activity.location}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    />
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={activity.description}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Hours)</Label>
                    <Input
                        id="duration"
                        name="duration"
                        type="number"
                        value={activity.duration}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                    />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">New Image (Optional)</Label>
                        <Input 
                            id="image"
                            type="file"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            accept="image/png, image/jpeg, image/webp"
                        />
                         <p className="text-sm text-muted-foreground pt-1">Upload a new image to replace the current one.</p>
                    </div>
                </div>

                {activity.image_url && (
                    <div className="space-y-2">
                        <Label>Current Image</Label>
                        <Image
                            src={`https://content-provider.payshia.com/travel-web${activity.image_url}`}
                            alt={activity.name}
                            width={128}
                            height={128}
                            data-ai-hint="current activity image"
                            className="rounded-md object-cover border"
                        />
                    </div>
                )}
               
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                       "Save Changes"
                    )}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
