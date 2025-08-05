
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DestinationForm, type DestinationFormData } from "@/components/admin/DestinationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/lib/types";
import { getInitialDestinations } from '@/lib/destination-data';

const LOCAL_STORAGE_DESTINATIONS_KEY = "LANKA_ADMIN_DESTINATIONS";
 
export default function EditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const destinationId = params.id as string;

  const [destination, setDestination] = useState<Destination | null | undefined>(undefined); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (destinationId && typeof window !== 'undefined') {
      setIsLoadingData(true);
      const storedDestinationsRaw = localStorage.getItem(LOCAL_STORAGE_DESTINATIONS_KEY);
      let destinations: Destination[] = [];
      if (storedDestinationsRaw) {
         try {
            destinations = JSON.parse(storedDestinationsRaw);
        } catch (e) {
            console.error("Failed to parse destinations from localStorage for edit", e);
            destinations = getInitialDestinations(); // Fallback
            localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(destinations));
        }
      } else {
        destinations = getInitialDestinations();
        localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(destinations));
      }
      
      const foundDestination = destinations.find(d => d.id === destinationId);
      setDestination(foundDestination || null);
      setIsLoadingData(false);
    }
  }, [destinationId]);

  const handleSubmit = async (data: DestinationFormData) => {
    setIsSubmitting(true);
    
    if (typeof window !== 'undefined' && destination) {
        try {
            const storedDestinationsRaw = localStorage.getItem(LOCAL_STORAGE_DESTINATIONS_KEY);
            let destinations: Destination[] = [];
            if (storedDestinationsRaw) {
                 destinations = JSON.parse(storedDestinationsRaw);
            }

            const destinationIndex = destinations.findIndex(d => d.id === destinationId);
            if (destinationIndex !== -1) {
                destinations[destinationIndex] = {
                ...destinations[destinationIndex],
                ...data,
                images: data.images || [],
                };
                localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(destinations));
                toast({
                title: "Destination Updated",
                description: `Destination "${data.name}" has been successfully updated.`,
                });
                router.push("/admin/destinations");
            } else {
                toast({
                    title: "Error",
                    description: "Could not find the destination to update.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating destination:", error);
            toast({
                title: "Error",
                description: "Could not update destination. Please try again.",
                variant: "destructive",
            });
        }
    }
    setIsSubmitting(false);
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading destination data...</p>
      </div>
    );
  }

  if (destination === null) {
    return (
      <div className="space-y-6 text-center">
         <h1 className="text-2xl font-bold text-destructive">Destination Not Found</h1>
        <p className="text-muted-foreground">The destination with ID "{destinationId}" could not be found.</p>
        <Button onClick={() => router.push("/admin/destinations")}>Back to Destinations</Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Edit Destination</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Details for: {destination?.name}</CardTitle>
          <CardDescription>Update the information for this destination.</CardDescription>
        </CardHeader>
        <CardContent>
          {destination && <DestinationForm initialData={destination} onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />}
        </CardContent>
      </Card>
    </div>
  );
}
