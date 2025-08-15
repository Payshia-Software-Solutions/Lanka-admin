
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, DollarSign, CalendarDays, Loader2 } from "lucide-react";
import type { Package, PackageStatus } from "@/lib/types";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { getInitialPackages } from '@/lib/package-data';

const LOCAL_STORAGE_PACKAGES_KEY = "LANKA_ADMIN_PACKAGES";

interface AccommodationType {
    id: number;
    company_id: number;
    name: string;
}

const statusColors: Record<PackageStatus, string> = {
  Draft: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  Published: "bg-green-500/20 text-green-700 border-green-500/30",
  Archived: "bg-neutral-500/20 text-neutral-700 border-neutral-500/30",
};


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
    fetchAccommodationTypes();
  }, [companyId]); // Refetch if companyId changes


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
            throw new Error("Failed to add accommodation type.");
        }
    } catch (error) {
        console.error("Error adding accommodation type:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add accommodation type." });
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
            throw new Error("Failed to delete accommodation type.");
        }
    } catch (error) {
        console.error("Error deleting accommodation type:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete accommodation type." });
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading packages...</p>
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Packages</CardTitle>
          <CardDescription>Manage tour packages available on your websites.</CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Website ID</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <Image 
                        src={pkg.coverImageUrl || "https://placehold.co/40x40.png"} 
                        alt={pkg.title} 
                        width={40} 
                        height={40} 
                        className="rounded-sm object-cover"
                        data-ai-hint="tour package" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{pkg.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                        {pkg.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
                        {pkg.durationDays} days
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-semibold ${statusColors[pkg.status]}`}>{pkg.status}</Badge>
                    </TableCell>
                    <TableCell>{pkg.websiteId}</TableCell>
                    <TableCell>{format(new Date(pkg.updatedAt), "PP")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/packages/${pkg.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Package
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/packages/${pkg.id}/itinerary`}>
                              <Eye className="mr-2 h-4 w-4" /> {/* Using Eye as placeholder for itinerary list/view */}
                              Manage Itinerary
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Package
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No packages found.</p>
              <p>Click "Add New Package" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="font-headline text-xl">Manage Accommodation Types</CardTitle>
              <CardDescription>Add or remove accommodation types used in your packages.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                  <div>
                      <h3 className="font-medium mb-4">Existing Types</h3>
                      {isLoadingAccommodation ? (
                          <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin"/>
                              <span>Loading...</span>
                          </div>
                      ) : accommodationTypes.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                              {accommodationTypes.map(type => (
                                  <div key={type.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                                      <span className="text-sm">{type.name}</span>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteAccommodationType(type.id)}>
                                          <Trash2 className="h-4 w-4 text-destructive"/>
                                      </Button>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-sm text-muted-foreground">No accommodation types found.</p>
                      )}
                  </div>
                  <div>
                      <h3 className="font-medium mb-4">Add New Type</h3>
                      <form onSubmit={handleAddAccommodationType} className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="accommodation-name">Type Name</Label>
                              <Input 
                                id="accommodation-name"
                                placeholder="e.g., Luxury Hotel, Boutique Villa"
                                value={newAccommodationName}
                                onChange={e => setNewAccommodationName(e.target.value)}
                                disabled={isSubmittingAccommodation}
                              />
                          </div>
                          <Button type="submit" disabled={isSubmittingAccommodation || !newAccommodationName.trim()}>
                              {isSubmittingAccommodation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                              Add Type
                          </Button>
                      </form>
                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
