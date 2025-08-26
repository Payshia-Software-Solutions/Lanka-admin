
"use client";

import { useState, useEffect } from "react";
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
import { Loader2, ChevronDown, User, Calendar, MapPin, Bus, Smile, Plus, Star, Bed, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TripPlan, TripPlanDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

async function fetchTripPlanDetails(tripId: number): Promise<TripPlanDetails> {
    const urls = {
        plan: `http://localhost/travel_web_server/trip_plans/${tripId}`,
        activities: `http://localhost/travel_web_server/trip_activities/${tripId}`,
        destinations: `http://localhost/travel_web_server/trip_destinations/${tripId}`,
        transportations: `http://localhost/travel_web_server/trip_transportations/trip/${tripId}`,
        interests: `http://localhost/travel_web_server/trip_interests/${tripId}`,
        addons: `http://localhost/travel_web_server/trip_addons/trip/${tripId}`,
        amenities: `http://localhost/travel_web_server/trip_amenities/trip/${tripId}`,
    };

    const responses = await Promise.all(Object.values(urls).map(url => fetch(url).then(res => res.json())));
    const [plan, activities, destinations, transportations, interests, addons, amenities] = responses;
    
    let user = null;
    if (plan && plan.user_id) {
       const userRes = await fetch(`http://localhost/travel_web_server/users/${plan.user_id}`);
       if(userRes.ok) {
           user = await userRes.json();
       }
    }

    return { plan, user, activities, destinations, transportations, interests, addons, amenities };
}


export default function TripPlansPage() {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState<TripPlanDetails | null>(null);

  const fetchTripPlans = async () => {
    setIsLoading(true);
    try {
        const response = await fetch("http://localhost/travel_web_server/trip_plans");
        if (!response.ok) {
            throw new Error("Failed to fetch trip plans");
        }
        const data = await response.json();
        setTripPlans(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Error fetching trip plans:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load trip plans."
        });
        setTripPlans([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripPlans();
  }, []);
  
  const handleRowClick = async (planId: number) => {
    if (selectedPlanId === planId) {
      setSelectedPlanId(null); // Collapse if already open
      setPlanDetails(null);
    } else {
      setSelectedPlanId(planId);
      setIsDetailsLoading(true);
      setPlanDetails(null);
      try {
        const details = await fetchTripPlanDetails(planId);
        setPlanDetails(details);
      } catch (error) {
        console.error("Error fetching trip plan details:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load trip plan details."
        });
      } finally {
        setIsDetailsLoading(false);
      }
    }
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
        <h1 className="text-3xl font-bold font-headline text-foreground">Client Trip Plans</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Submitted Plans</CardTitle>
          <CardDescription>Review custom trip itineraries submitted by your clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {tripPlans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Trip Dates</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripPlans.map((plan) => (
                  <>
                  <TableRow key={plan.id} onClick={() => handleRowClick(plan.id)} className="cursor-pointer">
                    <TableCell className="font-medium">{plan.full_name}</TableCell>
                    <TableCell>
                      {plan.start_date && plan.end_date ? (
                        `${format(new Date(plan.start_date.replace(' ', 'T')), "MMM d, yyyy")} - ${format(new Date(plan.end_date.replace(' ', 'T')), "MMM d, yyyy")}`
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{plan.duration} days</TableCell>
                    <TableCell>
                        {plan.number_of_adults} Adults
                        {plan.number_of_children > 0 && `, ${plan.number_of_children} Children`}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon">
                           <ChevronDown className={`h-5 w-5 transition-transform ${selectedPlanId === plan.id ? 'rotate-180' : ''}`} />
                       </Button>
                    </TableCell>
                  </TableRow>
                   {selectedPlanId === plan.id && (
                     <TableRow>
                       <TableCell colSpan={5}>
                         {isDetailsLoading && (
                            <div className="flex justify-center items-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-4">Loading details...</p>
                            </div>
                         )}
                         {planDetails && !isDetailsLoading && (
                           <div className="p-4 bg-secondary/30 rounded-lg space-y-6">

                               {/* User & Trip Details */}
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                   <Card>
                                       <CardHeader className="flex flex-row items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-lg">Customer Details</CardTitle>
                                       </CardHeader>
                                       <CardContent className="text-sm space-y-2">
                                            <p><strong>Name:</strong> {planDetails.user?.full_name}</p>
                                            <p><strong>Email:</strong> {planDetails.user?.email}</p>
                                            <p><strong>Phone:</strong> {planDetails.user?.phone_number}</p>
                                       </CardContent>
                                   </Card>
                                    <Card>
                                       <CardHeader className="flex flex-row items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-lg">Trip Overview</CardTitle>
                                       </CardHeader>
                                       <CardContent className="text-sm space-y-2">
                                            <p><strong>Pace:</strong> <Badge variant="outline">{planDetails.plan?.pace}</Badge></p>
                                            <p><strong>Interests:</strong> {(Array.isArray(planDetails.interests) ? planDetails.interests : [planDetails.interests].filter(Boolean)).map(i => i.interest_name).join(', ')}</p>
                                       </CardContent>
                                   </Card>
                               </div>

                                {/* Destinations & Activities */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Destinations</CardTitle></CardHeader>
                                        <CardContent>
                                          <ul className="list-disc list-inside text-sm">{planDetails.destinations?.map(d => <li key={d.id}>{d.destination_name}</li>)}</ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-2"><Star className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Activities</CardTitle></CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside text-sm">{planDetails.activities?.map(a => <li key={a.id}>{a.activity_name}</li>)}</ul>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                {/* Transportation, Accommodation, Addons */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-2"><Bus className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Transport</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{planDetails.transportations?.[0]?.transportation_type || 'Not specified'}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-2"><Bed className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Accommodation</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{planDetails.amenities?.map(a => a.amenity_name).join(', ') || 'Not specified'}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-2"><Plus className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Add-ons</CardTitle></CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside text-sm">{planDetails.addons?.map(a => <li key={a.id}>{a.addon_name}</li>)}</ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Additional Comments */}
                                {planDetails.plan?.additional_requests && (
                                     <Card>
                                        <CardHeader><CardTitle className="text-lg">Additional Client Requests</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{planDetails.plan.additional_requests}</p>
                                        </CardContent>
                                    </Card>
                                )}
                           </div>
                         )}
                       </TableCell>
                     </TableRow>
                   )}
                  </>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Plane className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg">No trip plans found.</p>
              <p>When clients create plans from the front-end, they will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
