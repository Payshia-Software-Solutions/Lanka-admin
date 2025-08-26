
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { TripPlanForm, type TripPlanFormData } from "@/components/admin/TripPlanForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";


export default function NewTripPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TripPlanFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost/travel_web_server/trip_plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast({
          title: "Trip Plan Created!",
          description: "The new trip plan has been successfully created.",
      });
      router.push("/admin/tripplans");

    } catch (error) {
        console.error("Trip plan creation error:", error);
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
        <h1 className="text-3xl font-bold font-headline text-foreground">Create New Trip Plan</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Trip Plan Details</CardTitle>
            <CardDescription>Fill out the multi-step form to create a new trip plan.</CardDescription>
        </CardHeader>
        <CardContent>
            <TripPlanForm onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}

