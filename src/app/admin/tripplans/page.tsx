
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { TripPlan } from "@/lib/types";

const LOCAL_STORAGE_KEY = "LANKA_ADMIN_TRIP_PLANS";

export default function TripPlansPage() {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const storedPlansRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPlansRaw) {
        try {
          const storedPlans = JSON.parse(storedPlansRaw).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          setTripPlans(storedPlans);
        } catch (error) {
          console.error("Error parsing trip plans from localStorage:", error);
          setTripPlans([]);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const handleDelete = (planId: string) => {
    const updatedPlans = tripPlans.filter((plan) => plan.id !== planId);
    setTripPlans(updatedPlans);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlans));
    toast({
      title: "Trip Plan Deleted",
      description: "The trip plan has been successfully removed.",
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading trip plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Trip Plan Management</h1>
        <Button asChild>
          <Link href="/admin/tripplans/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Trip Plan
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Trip Plans</CardTitle>
          <CardDescription>Manage custom trip itineraries for your clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {tripPlans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration (Days)</TableHead>
                  <TableHead>Destinations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.durationDays}</TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate">
                      {plan.destinations.join(', ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild disabled>
                              <Link href={`/admin/tripplans/${plan.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete "{plan.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(plan.id)} className="bg-destructive hover:bg-destructive/90">
                                  Yes, delete
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
              <Plane className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg">No trip plans found.</p>
              <p>Click "Create Trip Plan" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
