"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';

export default function PackageItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id;

  // Fetch package details based on packageId if needed

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold font-headline text-foreground">Manage Itinerary</h1>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Itinerary Day
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Package Itinerary for ID: {packageId}</CardTitle>
          <CardDescription>Define day-by-day activities for this package.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">No itinerary days defined yet.</p>
            <p>Click "Add Itinerary Day" to start building the schedule.</p>
            {/* Placeholder for itinerary day list and forms */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
