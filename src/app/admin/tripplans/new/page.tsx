
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { TripPlanForm, type TripPlanFormData } from "@/components/admin/TripPlanForm";
import { useToast } from "@/hooks/use-toast";
import type { TripPlan } from "@/lib/types";

const LOCAL_STORAGE_KEY = "LANKA_ADMIN_TRIP_PLANS";

export default function NewTripPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TripPlanFormData) => {
    setIsSubmitting(true);
    
    try {
      if (typeof window !== 'undefined') {
        const storedPlansRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        let plans: TripPlan[] = [];
        if (storedPlansRaw) {
          plans = JSON.parse(storedPlansRaw).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
        }

        const newPlan: TripPlan = {
          ...data,
          id: `tp_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        plans.push(newPlan);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));

        toast({
          title: "Trip Plan Created",
          description: `Successfully created "${data.title}".`,
        });
        router.push("/admin/tripplans");
      }
    } catch (error) {
      console.error("Error creating trip plan:", error);
      toast({
        title: "Error",
        description: "Could not create the trip plan. Please try again.",
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
        <h1 className="text-3xl font-bold font-headline text-foreground">Create New Trip Plan</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Trip Plan Details</CardTitle>
          <CardDescription>Fill out the form to create a new custom trip plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <TripPlanForm onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
