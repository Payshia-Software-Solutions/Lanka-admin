
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ApiDestination } from "@/lib/types";
import { DetailedDestinationForm } from "@/components/admin/DetailedDestinationForm";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function EditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const destinationId = params.id as string;

  const [destination, setDestination] = useState<ApiDestination | null>(null); 
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

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
        const response = await fetch(`http://localhost/travel_web_server/destinations/${destinationId}`, {
            method: 'POST', // Using POST with _method override
            body: data,
        });

        if (response.ok) {
            const responseData = await response.json();
            toast({
                title: "Destination Updated",
                description: `Successfully updated "${responseData?.destination.name || 'destination'}".`,
            });
            router.push("/admin/destinations");
            router.refresh();
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
          <CardDescription>Update the information for this destination. Below is the current content.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 mb-8 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold">Current Content</h3>
            
            <div>
              <Label className="text-base font-semibold">Destination Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {destination.hero_bg_image_url && (
                  <div>
                      <Label className="text-sm font-medium">Hero Image</Label>
                      <Image src={`https://content-provider.payshia.com/travel-web${destination.hero_bg_image_url}`} alt="Current hero image" data-ai-hint="hero background" width={200} height={150} className="rounded-md object-cover mt-1 border" />
                  </div>
                )}
                {destination.intro_image_url && (
                  <div>
                      <Label className="text-sm font-medium">Intro Image</Label>
                      <Image src={`https://content-provider.payshia.com/travel-web${destination.intro_image_url}`} alt="Current intro image" data-ai-hint="introduction" width={200} height={150} className="rounded-md object-cover mt-1 border" />
                  </div>
                )}
                {destination.image_url && (
                  <div>
                      <Label className="text-sm font-medium">Main Image</Label>
                      <Image src={`https://content-provider.payshia.com/travel-web${destination.image_url}`} alt="Current main image" data-ai-hint="main destination" width={200} height={150} className="rounded-md object-cover mt-1 border" />
                  </div>
                )}
              </div>
              {destination.gallery_image_urls && destination.gallery_image_urls.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Gallery Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {destination.gallery_image_urls.map((url, index) => (
                        <Image key={index} src={`https://content-provider.payshia.com/travel-web${url}`} alt={`Gallery image ${index + 1}`} data-ai-hint="destination gallery" width={200} height={150} className="rounded-md object-cover border" />
                      ))}
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            {destination.things_to_do && destination.things_to_do.length > 0 && (
              <div>
                <Label className="text-base font-semibold">Things to Do</Label>
                 <div className="space-y-4 mt-2">
                    {destination.things_to_do.map((item, index) => (
                      <div key={index} className="p-3 border rounded-md flex items-start gap-4 bg-background">
                         {item.image_url && (
                           <Image 
                             src={`https://content-provider.payshia.com/travel-web${item.image_url}`} 
                             alt={item.title}
                             data-ai-hint="thing to do"
                             width={120}
                             height={90}
                             className="rounded-md object-cover"
                           />
                         )}
                         <div className="flex-1">
                           <p className="font-semibold text-foreground">{item.title}</p>
                           <p className="text-sm text-muted-foreground">{item.description}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
          
          <Separator className="my-8" />
          
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
