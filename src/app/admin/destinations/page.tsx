
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndFilterDestinations = async () => {
      setIsLoading(true);
      try {
        // Fetch all destinations from the backend
        const response = await fetch('http://localhost/travel_web_server/destinations');
        if (!response.ok) {
          throw new Error(`Failed to fetch destinations. Status: ${response.status}`);
        }
        
        const allDestinations = await response.json();
        if (!Array.isArray(allDestinations)) {
            // Handle case where API returns an error object like { "error": "..." }
            console.error("Fetched data is not an array:", allDestinations);
            throw new Error("Received invalid data from server.");
        }

        // Get companyId from logged-in user in localStorage
        let companyId: string | null = null;
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('loggedInUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.company_id) {
                companyId = parsedUser.company_id.toString();
              }
            } catch (error) {
              console.error("Failed to parse user from localStorage", error);
            }
          }
        }

        // Filter destinations based on companyId
        if (companyId) {
          const filteredDestinations = allDestinations.filter(
            (dest: any) => dest.company_id && dest.company_id.toString() === companyId
          );
          setDestinations(filteredDestinations);
        } else {
          setDestinations([]);
          console.warn("No companyId found for logged in user. No destinations will be shown.");
        }

      } catch (error) {
        console.error("Error fetching destinations:", error);
        toast({
          variant: "destructive",
          title: "Failed to load destinations",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndFilterDestinations();
  }, [toast]);

  const handleDeleteDestination = async (destinationId: string) => {
    try {
        const response = await fetch(`http://localhost/travel_web_server/destinations/${destinationId}`, {
            method: 'DELETE',
        });

        if (response.ok || response.status === 204) { // 204 No Content is a success status for delete
            setDestinations(destinations.filter((dest) => dest.id !== destinationId));
            toast({
                title: "Destination Deleted",
                description: "The destination has been successfully removed.",
                variant: "destructive"
            });
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to delete. The server sent an invalid response.' }));
            throw new Error(errorData.error || 'Failed to delete destination.');
        }

    } catch (error) {
        console.error("Error deleting destination:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
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
                        {destination.company_id}
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
                                <AlertDialogAction onClick={() => handleDeleteDestination(destination.id.toString())} className="bg-destructive hover:bg-destructive/90">
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
              <p className="text-lg">No destinations found for your company.</p>
              <p>Click "Add New Destination" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
