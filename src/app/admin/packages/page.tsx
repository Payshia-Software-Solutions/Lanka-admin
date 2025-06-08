
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, DollarSign, CalendarDays, Loader2 } from "lucide-react";
import type { Package, PackageStatus } from "@/lib/types";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { getInitialPackages } from '@/lib/package-data';

const LOCAL_STORAGE_PACKAGES_KEY = "LANKA_ADMIN_PACKAGES";

const statusColors: Record<PackageStatus, string> = {
  Draft: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  Published: "bg-green-500/20 text-green-700 border-green-500/30",
  Archived: "bg-neutral-500/20 text-neutral-700 border-neutral-500/30",
};


export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
    </div>
  );
}

