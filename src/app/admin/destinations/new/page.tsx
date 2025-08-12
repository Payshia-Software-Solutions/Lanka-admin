
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { DetailedDestinationForm } from "@/components/admin/DetailedDestinationForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { DestinationFormData } from "@/components/admin/DetailedDestinationForm";


export default function NewDestinationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DestinationFormData) => {
    setIsSubmitting(true);
    
    // Map form data to the expected API structure
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
        is_popular: true, // Defaulting to true as per example
    };

    try {
        const response = await fetch('http://localhost/travel_web_server/destinations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
        });

        if (response.ok) {
            const newDestination = await response.json();
            toast({
                title: "Destination Created!",
                description: `Successfully created "${newDestination.name}".`,
            });
            router.push("/admin/destinations");
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create destination.');
        }

    } catch (error) {
        console.error("Destination creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Create New Destination</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Destination Details</CardTitle>
            <CardDescription>Fill out the form to add a new destination.</CardDescription>
        </CardHeader>
        <CardContent>
            <DetailedDestinationForm 
                onSubmitForm={handleSubmit} 
                isSubmitting={isSubmitting} 
            />
        </CardContent>
      </Card>
    </div>
  );
}
