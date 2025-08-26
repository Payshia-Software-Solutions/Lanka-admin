
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import type { Activity } from "@/lib/types";


export default function ActivitiesPage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    location: "",
    duration: "",
    image: null as File | null,
  });

  const companyId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("loggedInUser") || "{}").company_id
      : null;

  const fetchActivities = async () => {
    if (!companyId) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost/travel_web_server/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
      const allActivities = await response.json();
      if (Array.isArray(allActivities)) {
        const filteredActivities = allActivities.filter(
          (act: Activity) => act.company_id.toString() === companyId.toString()
        );
        setActivities(filteredActivities);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load activities.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [companyId]);
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewActivity({ ...newActivity, image: event.target.files[0] });
    }
  };

  const handleAddActivity = async (event: FormEvent) => {
    event.preventDefault();
    if (!newActivity.name.trim() || !companyId) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', newActivity.name);
    formData.append('description', newActivity.description);
    formData.append('location', newActivity.location);
    formData.append('duration', newActivity.duration);
    formData.append('company_id', companyId.toString());
    if (newActivity.image) {
      formData.append('image', newActivity.image);
    }

    try {
      const response = await fetch("http://localhost/travel_web_server/activities", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Success", description: "Activity added." });
        setNewActivity({ name: "", description: "", location: "", duration: "", image: null });
        fetchActivities(); // Refresh list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add activity.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost/travel_web_server/activities/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok || response.status === 204) {
        toast({ title: "Success", description: "Activity deleted." });
        fetchActivities(); // Refresh list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete activity.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">
          Activity Management
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Activity</CardTitle>
          <CardDescription>
            Add activities that can be included in tour packages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-name">Activity Name</Label>
                <Input
                  id="activity-name"
                  placeholder="e.g., Whale Watching"
                  value={newActivity.name}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, name: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-location">Location</Label>
                <Input
                  id="activity-location"
                  placeholder="e.g., Mirissa"
                  value={newActivity.location}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, location: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-description">Description</Label>
              <Textarea
                id="activity-description"
                placeholder="A brief description of the activity."
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="activity-duration">Duration (Days)</Label>
                <Input
                    id="activity-duration"
                    type="number"
                    placeholder="e.g., 1"
                    value={newActivity.duration}
                    onChange={(e) =>
                    setNewActivity({ ...newActivity, duration: e.target.value })
                    }
                    disabled={isSubmitting}
                />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="activity-image">Image</Label>
                    <Input 
                        id="activity-image"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        accept="image/png, image/jpeg, image/webp"
                    />
                </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <PlusCircle />
              )}
              <span className="ml-2">Add Activity</span>
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>All Activities</CardTitle>
            <CardDescription>View and manage all existing activities.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : activities.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Duration (Days)</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                             <TableRow key={activity.id}>
                                <TableCell>
                                    {activity.image_url ? (
                                        <Image
                                            src={`https://content-provider.payshia.com/travel-web/${activity.image_url}`}
                                            alt={activity.name}
                                            width={64}
                                            height={64}
                                            data-ai-hint="activity image"
                                            className="rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{activity.name}</TableCell>
                                <TableCell>{activity.location}</TableCell>
                                <TableCell>{activity.duration}</TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{activity.description}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the "{activity.name}" activity. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Yes, delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <p className="text-center text-sm text-muted-foreground py-4">No activities added yet.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
