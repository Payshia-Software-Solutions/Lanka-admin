
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
    </div>
  );
}
