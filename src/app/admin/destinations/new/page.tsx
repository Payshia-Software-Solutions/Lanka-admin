
"use client";

import { useState } from "react";
import { DestinationForm, type DestinationFormData } from "@/components/admin/DestinationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/lib/types";

const LOCAL_STORAGE_DESTINATIONS_KEY = "LANKA_ADMIN_DESTINATIONS";

export default function NewDestinationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DestinationFormData) => {
    setIsSubmitting(true);
    
    try {
      if (typeof window !== 'undefined') {
        const storedDestinationsRaw = localStorage.getItem(LOCAL_STORAGE_DESTINATIONS_KEY);
        let destinations: Destination[] = [];
        if (storedDestinationsRaw) {
          destinations = JSON.parse(storedDestinationsRaw);
        }

        const newDestination: Destination = {
          ...data,
          id: `dest${Date.now()}`, // Simple unique ID
          images: data.images || [],
        };
        
        destinations.push(newDestination);
        localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(destinations));

        toast({
          title: "Destination Created",
          description: `Destination "${data.name}" has been successfully created.`,
        });
        router.push("/admin/destinations");
      }
    } catch (error) {
      console.error("Error creating destination:", error);
      toast({
        title: "Error",
        description: "Could not create the destination. Please try again.",
        variant: "destructive",
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
          <CardTitle className="font-headline text-xl">Destination Details</CardTitle>
          <CardDescription>Fill in the information for the new tourism destination.</CardDescription>
        </CardHeader>
        <CardContent>
          <DestinationForm onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
