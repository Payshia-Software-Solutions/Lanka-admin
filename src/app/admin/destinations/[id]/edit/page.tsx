
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/lib/types";
import { DetailedDestinationForm, type DestinationFormData } from "@/components/admin/DetailedDestinationForm";

export default function EditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const destinationId = params.id as string;

  const [destination, setDestination] = useState<Destination | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!destinationId) return;

    const fetchDestination = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch(`http://localhost/travel_web_server/destinations/${destinationId}`);
        if (response.ok) {
          const data = await response.json();
          setDestination(data);
        } else {
          setDestination(null);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch destination data.",
          });
        }
      } catch (error) {
        console.error("Error fetching destination data:", error);
        setDestination(null);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching destination data.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchDestination();
  }, [destinationId, toast]);

  const handleSubmit = async (data: DestinationFormData) => {
    setIsSubmitting(true);
    
    const apiData = {
        company_id: parseInt(data.websiteId, 10),
        name: data.name,
        hero_heading: data.heroHeading,
        hero_subheading: data.heroSubheading,
        hero_bg_image_url: data.heroBgImageUrl,
        intro_heading: data.introHeading,
        description: data.introDescription,
        intro_image_url: data.introImageUrl,
        location: data.location,
        gallery_image_urls: data.galleryImageUrls.map(item => item.url),
        things_to_do: data.thingsToDo,
        nearby_attractions: data.nearbyAttractions,
        travel_tip_heading: data.travelTipHeading,
        travel_tip_icon: data.travelTipIcon,
        travel_tip_description: data.travelTipDescription,
        is_popular: data.is_popular,
    };

    try {
        const response = await fetch(`http://localhost/travel_web_server/destinations/${destinationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
        });

        if (response.ok) {
            toast({
                title: "Destination Updated",
                description: `Successfully updated "${apiData.name}".`,
            });
            router.push("/admin/destinations");
            router.refresh(); // To see the changes in the list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update destination.');
        }
    } catch (error) {
        console.error("Destination update error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading destination data...</p>
      </div>
    );
  }

  if (!destination) {
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
          <DetailedDestinationForm 
            initialData={destination} 
            onSubmitForm={handleSubmit} 
            isSubmitting={isSubmitting} 
            isEditing={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
