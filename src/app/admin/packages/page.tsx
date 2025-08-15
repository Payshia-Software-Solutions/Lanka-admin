
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import type { Package } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getInitialPackages } from '@/lib/package-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const LOCAL_STORAGE_PACKAGES_KEY = "LANKA_ADMIN_PACKAGES";

interface AccommodationType {
    id: number;
    company_id: number;
    name: string;
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

  useEffect(() => {
    if (companyId) {
        fetchAccommodationTypes();
    }
  }, [companyId, toast]);


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
    </div>
  );
}

    