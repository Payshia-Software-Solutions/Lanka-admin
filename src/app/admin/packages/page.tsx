
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import type { Package, Hotel, MealType, VehicleType, Destination } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getInitialPackages } from '@/lib/package-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const LOCAL_STORAGE_PACKAGES_KEY = "LANKA_ADMIN_PACKAGES";

interface AccommodationType {
    id: number;
    company_id: number;
    name: string;
}

interface Activity {
    id: number;
    company_id: number;
    name: string;
    description: string;
    location: string;
    duration: number;
}


export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // State for Accommodation Types
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationType[]>([]);
  const [isLoadingAccommodation, setIsLoadingAccommodation] = useState(true);
  const [newAccommodationName, setNewAccommodationName] = useState("");
  const [isSubmittingAccommodation, setIsSubmittingAccommodation] = useState(false);
  
  // State for Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [newActivity, setNewActivity] = useState({ name: "", description: "", location: "", duration: "" });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // State for Hotels
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);
  const [newHotel, setNewHotel] = useState({ name: "", location: "", accommodation_type_id: "", destination_id: "" });
  const [isSubmittingHotel, setIsSubmittingHotel] = useState(false);
  
  // State for Destinations
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);

  // State for Meal Types
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [isLoadingMealTypes, setIsLoadingMealTypes] = useState(true);
  const [newMealType, setNewMealType] = useState({ name: "", description: "" });
  const [isSubmittingMealType, setIsSubmittingMealType] = useState(false);
  
  const companyId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('loggedInUser') || '{}').company_id : null;


  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const storedPackagesRaw = localStorage.getItem(LOCAL_STORAGE_PACKAGES_KEY);
      if (storedPackagesRaw) {
        try {
          const storedPackages = JSON.parse(storedPackagesRaw).map((p: any) => ({
            ...p,
            availabilityStart: p.availabilityStart ? new Date(p.availabilityStart) : undefined,
            availabilityEnd: p.availabilityEnd ? new Date(p.availabilityEnd) : undefined,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          setPackages(storedPackages);
        } catch (error) {
          console.error("Error parsing packages from localStorage:", error);
          const initialData = getInitialPackages();
          setPackages(initialData);
          localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(initialData));
        }
      } else {
        const initialData = getInitialPackages();
        setPackages(initialData);
        localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(initialData));
      }
    }
    setIsLoading(false);
  }, []);

  const fetchAccommodationTypes = async () => {
      if (!companyId) return;
      setIsLoadingAccommodation(true);
      try {
        const response = await fetch('http://localhost/travel_web_server/accommodation_types');
        if (!response.ok) throw new Error("Failed to fetch accommodation types");
        const allTypes = await response.json();
        const filteredTypes = allTypes.filter((type: AccommodationType) => type.company_id.toString() === companyId.toString());
        setAccommodationTypes(filteredTypes);
      } catch (error) {
        console.error("Error fetching accommodation types:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load accommodation types." });
      } finally {
        setIsLoadingAccommodation(false);
      }
  };

  const fetchActivities = async () => {
      if (!companyId) return;
      setIsLoadingActivities(true);
      try {
        const response = await fetch('http://localhost/travel_web_server/activities');
        if (!response.ok) throw new Error("Failed to fetch activities");
        const allActivities = await response.json();
        if (Array.isArray(allActivities)) {
            const filteredActivities = allActivities.filter((act: Activity) => act.company_id.toString() === companyId.toString());
            setActivities(filteredActivities);
        } else {
            setActivities([]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load activities." });
      } finally {
        setIsLoadingActivities(false);
      }
  };

  const fetchDestinations = async () => {
      if (!companyId) return;
      setIsLoadingDestinations(true);
      try {
        const response = await fetch('http://localhost/travel_web_server/destinations');
        if (!response.ok) throw new Error("Failed to fetch destinations");
        const allDestinations = await response.json();
        if (Array.isArray(allDestinations)) {
            const filtered = allDestinations.filter((dest: Destination) => dest.company_id.toString() === companyId.toString());
            setDestinations(filtered);
        } else {
            setDestinations([]);
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load destinations." });
      } finally {
        setIsLoadingDestinations(false);
      }
  };


  const fetchHotels = async () => {
      if (!companyId) return;
      setIsLoadingHotels(true);
      try {
        const response = await fetch('http://localhost/travel_web_server/hotels');
        if (!response.ok) throw new Error("Failed to fetch hotels");
        const allHotels = await response.json();
        if (Array.isArray(allHotels)) {
            const filteredHotels = allHotels.filter((hotel: Hotel) => hotel.company_id.toString() === companyId.toString());
            setHotels(filteredHotels);
        } else {
            setHotels([]);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load hotels." });
      } finally {
        setIsLoadingHotels(false);
      }
  };

  const fetchMealTypes = async () => {
      if (!companyId) return;
      setIsLoadingMealTypes(true);
      try {
        const response = await fetch('http://localhost/travel_web_server/meal_types');
        if (!response.ok) throw new Error("Failed to fetch meal types");
        const allTypes = await response.json();
        if (Array.isArray(allTypes)) {
            const filteredTypes = allTypes.filter((type: MealType) => type.company_id.toString() === companyId.toString());
            setMealTypes(filteredTypes);
        } else {
            setMealTypes([]);
        }
      } catch (error) {
        console.error("Error fetching meal types:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load meal types." });
      } finally {
        setIsLoadingMealTypes(false);
      }
  };


  useEffect(() => {
    if (companyId) {
        fetchAccommodationTypes();
        fetchActivities();
        fetchHotels();
        fetchMealTypes();
        fetchDestinations();
    }
  }, [companyId]);


  const handleDeletePackage = (packageId: string) => {
    const updatedPackages = packages.filter((pkg) => pkg.id !== packageId);
    setPackages(updatedPackages);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(updatedPackages));
    }
    toast({
      title: "Package Deleted",
      description: `Package with ID ${packageId} has been removed.`,
      variant: "destructive"
    });
  };

  const handleAddAccommodationType = async (event: FormEvent) => {
    event.preventDefault();
    if (!newAccommodationName.trim() || !companyId) return;

    setIsSubmittingAccommodation(true);
    try {
        const response = await fetch('http://localhost/travel_web_server/accommodation_types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newAccommodationName, company_id: companyId }),
        });
        if (response.ok) {
            toast({ title: "Success", description: "Accommodation type added." });
            setNewAccommodationName("");
            fetchAccommodationTypes(); // Refresh list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add accommodation type.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setIsSubmittingAccommodation(false);
    }
  }

  const handleDeleteAccommodationType = async (id: number) => {
    try {
        const response = await fetch(`http://localhost/travel_web_server/accommodation_types/${id}`, {
            method: 'DELETE',
        });
        if (response.ok || response.status === 204) {
             toast({ title: "Success", description: "Accommodation type deleted." });
             fetchAccommodationTypes(); // Refresh list
        } else {
             const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete accommodation type.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }

   const handleAddActivity = async (event: FormEvent) => {
    event.preventDefault();
    if (!newActivity.name.trim() || !companyId) return;

    setIsSubmittingActivity(true);
    try {
        const response = await fetch('http://localhost/travel_web_server/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newActivity, company_id: companyId, duration: parseInt(newActivity.duration, 10) || null }),
        });
        if (response.ok) {
            toast({ title: "Success", description: "Activity added." });
            setNewActivity({ name: "", description: "", location: "", duration: "" });
            fetchActivities(); // Refresh list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add activity.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setIsSubmittingActivity(false);
    }
  }

  const handleDeleteActivity = async (id: number) => {
    try {
        const response = await fetch(`http://localhost/travel_web_server/activities/${id}`, {
            method: 'DELETE',
        });
        if (response.ok || response.status === 204) {
             toast({ title: "Success", description: "Activity deleted." });
             fetchActivities(); // Refresh list
        } else {
             const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete activity.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }

  const handleAddHotel = async (event: FormEvent) => {
    event.preventDefault();
    if (!newHotel.name.trim() || !newHotel.accommodation_type_id || !newHotel.destination_id || !companyId) return;
    setIsSubmittingHotel(true);
    try {
        const response = await fetch('http://localhost/travel_web_server/hotels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ...newHotel, 
                company_id: companyId,
                accommodation_type_id: parseInt(newHotel.accommodation_type_id, 10),
                destination_id: parseInt(newHotel.destination_id, 10),
            }),
        });
        if (response.ok) {
            toast({ title: "Success", description: "Hotel added." });
            setNewHotel({ name: "", location: "", accommodation_type_id: "", destination_id: "" });
            fetchHotels(); // Refresh list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add hotel.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setIsSubmittingHotel(false);
    }
  }

  const handleDeleteHotel = async (id: number) => {
    try {
        const response = await fetch(`http://localhost/travel_web_server/hotels/${id}`, {
            method: 'DELETE',
        });
        if (response.ok || response.status === 204) {
             toast({ title: "Success", description: "Hotel deleted." });
             fetchHotels(); // Refresh list
        } else {
             const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete hotel.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }

  const handleAddMealType = async (event: FormEvent) => {
    event.preventDefault();
    if (!newMealType.name.trim() || !companyId) return;
    setIsSubmittingMealType(true);
    try {
        const response = await fetch('http://localhost/travel_web_server/meal_types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newMealType, company_id: companyId }),
        });
        if (response.ok) {
            toast({ title: "Success", description: "Meal type added." });
            setNewMealType({ name: "", description: "" });
            fetchMealTypes(); // Refresh list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add meal type.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setIsSubmittingMealType(false);
    }
  }

  const handleDeleteMealType = async (id: number) => {
    try {
        const response = await fetch(`http://localhost/travel_web_server/meal_types/${id}`, {
            method: 'DELETE',
        });
        if (response.ok || response.status === 204) {
             toast({ title: "Success", description: "Meal type deleted." });
             fetchMealTypes(); // Refresh list
        } else {
             const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete meal type.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }

  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading page data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Package Management</h1>
        <Button asChild>
          <Link href="/admin/packages/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Package
          </Link>
        </Button>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Manage Accommodation Types</CardTitle>
            <CardDescription>Add or remove accommodation types for your packages.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAccommodationType} className="flex items-center gap-2 mb-4">
              <div className="flex-grow">
                <Label htmlFor="accommodation-name" className="sr-only">Accommodation Name</Label>
                <Input 
                  id="accommodation-name"
                  placeholder="e.g., Luxury Hotel, Boutique Villa" 
                  value={newAccommodationName}
                  onChange={(e) => setNewAccommodationName(e.target.value)}
                  disabled={isSubmittingAccommodation}
                />
              </div>
              <Button type="submit" disabled={isSubmittingAccommodation}>
                {isSubmittingAccommodation ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                <span className="ml-2 hidden sm:inline">Add Type</span>
              </Button>
            </form>
            {isLoadingAccommodation ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : accommodationTypes.length > 0 ? (
              <ul className="space-y-2">
                {accommodationTypes.map(type => (
                  <li key={type.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                    <span className="font-medium text-sm">{type.name}</span>
                    
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
                            This will permanently delete the "{type.name}" accommodation type. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAccommodationType(type.id)} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No accommodation types added yet.</p>
            )}
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Activities</CardTitle>
          <CardDescription>Add or remove activities that can be included in packages.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddActivity} className="space-y-4 mb-6 pb-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-name">Activity Name</Label>
                <Input 
                  id="activity-name"
                  placeholder="e.g., Whale Watching"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  disabled={isSubmittingActivity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-location">Location</Label>
                <Input 
                  id="activity-location"
                  placeholder="e.g., Mirissa"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  disabled={isSubmittingActivity}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-description">Description</Label>
              <Textarea 
                id="activity-description"
                placeholder="A brief description of the activity."
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                disabled={isSubmittingActivity}
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="activity-duration">Duration (Days)</Label>
                <Input 
                  id="activity-duration"
                  type="number"
                  placeholder="e.g., 1"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                  disabled={isSubmittingActivity}
                />
              </div>
            <Button type="submit" disabled={isSubmittingActivity}>
              {isSubmittingActivity ? <Loader2 className="animate-spin" /> : <PlusCircle />}
              <span className="ml-2">Add Activity</span>
            </Button>
          </form>

          {isLoadingActivities ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activities.length > 0 ? (
            <ul className="space-y-2">
              {activities.map(activity => (
                <li key={activity.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                  <div>
                    <h4 className="font-semibold text-sm">{activity.name}</h4>
                    <p className="text-xs text-muted-foreground">{activity.location} - {activity.duration} Day(s)</p>
                  </div>
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
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">No activities added yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Manage Hotels</CardTitle>
            <CardDescription>Add or remove hotels and assign an accommodation type.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHotel} className="space-y-4 mb-6 pb-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="hotel-name">Hotel Name</Label>
                    <Input 
                        id="hotel-name"
                        placeholder="e.g., The Grand Hotel"
                        value={newHotel.name}
                        onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                        disabled={isSubmittingHotel}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="hotel-location">Location</Label>
                    <Input 
                        id="hotel-location"
                        placeholder="e.g., Nuwara Eliya"
                        value={newHotel.location}
                        onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                        disabled={isSubmittingHotel}
                    />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accommodation-type">Accommodation Type</Label>
                  <Select
                      value={newHotel.accommodation_type_id}
                      onValueChange={(value) => setNewHotel({ ...newHotel, accommodation_type_id: value })}
                      disabled={isSubmittingHotel || isLoadingAccommodation}
                  >
                      <SelectTrigger id="accommodation-type">
                          <SelectValue placeholder="Select an accommodation type" />
                      </SelectTrigger>
                      <SelectContent>
                          {accommodationTypes.map(type => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select
                      value={newHotel.destination_id}
                      onValueChange={(value) => setNewHotel({ ...newHotel, destination_id: value })}
                      disabled={isSubmittingHotel || isLoadingDestinations}
                  >
                      <SelectTrigger id="destination">
                          <SelectValue placeholder="Select a destination" />
                      </SelectTrigger>
                      <SelectContent>
                          {destinations.map(dest => (
                              <SelectItem key={dest.id} value={dest.id.toString()}>
                                  {dest.name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={isSubmittingHotel}>
                {isSubmittingHotel ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                <span className="ml-2">Add Hotel</span>
              </Button>
            </form>
             {isLoadingHotels ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                ) : hotels.length > 0 ? (
                <ul className="space-y-2">
                    {hotels.map(hotel => {
                      const destinationName = destinations.find(d => d.id === hotel.destination_id)?.name;
                      const accommodationTypeName = accommodationTypes.find(t => t.id === hotel.accommodation_type_id)?.name;
                      return (
                        <li key={hotel.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                          <div>
                            <h4 className="font-semibold text-sm">{hotel.name}</h4>
                            <p className="text-xs text-muted-foreground">
                                {destinationName || 'Unknown Destination'} - {accommodationTypeName || 'N/A'}
                            </p>
                          </div>
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
                                  This will permanently delete the "{hotel.name}" hotel. This action cannot be undone.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteHotel(hotel.id)} className="bg-destructive hover:bg-destructive/90">
                                  Yes, delete
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                          </AlertDialog>
                        </li>
                      );
                    })}
                </ul>
                ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No hotels added yet.</p>
            )}
          </CardContent>
        </Card>

      <Card>
          <CardHeader>
            <CardTitle>Manage Meal Types</CardTitle>
            <CardDescription>Add or remove meal types that can be included in packages.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMealType} className="space-y-4 mb-6 pb-6 border-b">
              <div className="space-y-2">
                <Label htmlFor="meal-type-name">Meal Type Name</Label>
                <Input 
                  id="meal-type-name"
                  placeholder="e.g., Full Board, Half Board"
                  value={newMealType.name}
                  onChange={(e) => setNewMealType({ ...newMealType, name: e.target.value })}
                  disabled={isSubmittingMealType}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal-type-description">Description</Label>
                <Textarea 
                  id="meal-type-description"
                  placeholder="A brief description of the meal type."
                  value={newMealType.description}
                  onChange={(e) => setNewMealType({ ...newMealType, description: e.target.value })}
                  disabled={isSubmittingMealType}
                />
              </div>
              <Button type="submit" disabled={isSubmittingMealType}>
                {isSubmittingMealType ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                <span className="ml-2">Add Meal Type</span>
              </Button>
            </form>
            {isLoadingMealTypes ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                ) : mealTypes.length > 0 ? (
                <ul className="space-y-2">
                    {mealTypes.map(meal => (
                    <li key={meal.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                        <div>
                        <h4 className="font-semibold text-sm">{meal.name}</h4>
                        <p className="text-xs text-muted-foreground">{meal.description}</p>
                        </div>
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
                                This will permanently delete the "{meal.name}" meal type. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMealType(meal.id)} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No meal types added yet.</p>
            )}
          </CardContent>
        </Card>
        
    </div>
  );
}
