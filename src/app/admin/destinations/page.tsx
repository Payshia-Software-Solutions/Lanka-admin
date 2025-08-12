
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Globe, Loader2 } from "lucide-react";
import type { Destination } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getInitialDestinations } from "@/lib/destination-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const LOCAL_STORAGE_DESTINATIONS_KEY = "LANKA_ADMIN_DESTINATIONS";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      let companyId: string | null = null;
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if(parsedUser.companyId) {
            companyId = parsedUser.companyId.toString();
          }
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
        }
      }

      const storedDestinationsRaw = localStorage.getItem(LOCAL_STORAGE_DESTINATIONS_KEY);
      let allDestinations: Destination[] = [];
      if (storedDestinationsRaw) {
        try {
          allDestinations = JSON.parse(storedDestinationsRaw);
        } catch (error) {
          console.error("Error parsing destinations from localStorage:", error);
          allDestinations = getInitialDestinations();
          localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(allDestinations));
        }
      } else {
        allDestinations = getInitialDestinations();
        localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(allDestinations));
      }

      if (companyId) {
        const filteredDestinations = allDestinations.filter(
          (dest) => dest.websiteId === companyId
        );
        setDestinations(filteredDestinations);
      } else {
        // Fallback or handle case where companyId is not found
        setDestinations([]);
         console.warn("No companyId found for logged in user. No destinations will be shown.");
      }
    }
    setIsLoading(false);
  }, []);

  const handleDeleteDestination = (destinationId: string) => {
    // Note: this deletion logic works on the complete destinations list in localStorage
    // to avoid re-introducing deleted items for other users of the same company.
    if (typeof window !== 'undefined') {
        const storedDestinationsRaw = localStorage.getItem(LOCAL_STORAGE_DESTINATIONS_KEY);
        if (storedDestinationsRaw) {
            let allDestinations = JSON.parse(storedDestinationsRaw);
            const updatedAllDestinations = allDestinations.filter((dest: Destination) => dest.id !== destinationId);
            localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(updatedAllDestinations));
            
            // Also update the currently displayed state
            const updatedFilteredDestinations = destinations.filter((dest) => dest.id !== destinationId);
            setDestinations(updatedFilteredDestinations);

            toast({
                title: "Destination Deleted",
                description: `Destination has been successfully removed.`,
                variant: "destructive"
            });
        }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading destinations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">
          Destination Management
        </h1>
        <Button asChild>
          <Link href="/admin/destinations/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Destination
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            All Destinations
          </CardTitle>
          <CardDescription>
            Manage tourism destinations for your websites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {destinations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Website ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">
                      {destination.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate">
                      {destination.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {destination.websiteId}
                      </div>
                    </TableCell>
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
                            <Link href={`/admin/destinations/${destination.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  destination "{destination.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDestination(destination.id)} className="bg-destructive hover:bg-destructive/90">
                                  Yes, delete destination
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No destinations found.</p>
              <p>Click "Add New Destination" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
