

"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
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
  Loader2,
  ChevronDown,
  User,
  Calendar,
  MapPin,
  Bus,
  Plus,
  Star,
  Bed,
  Plane,
  DollarSign,
  PlusCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TripPlan, TripPlanDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


async function fetchTripPlanDetails(tripId: number): Promise<TripPlanDetails> {
  const urls = {
    plan: `http://localhost/travel_web_server/trip_plans/${tripId}`,
    activities: `http://localhost/travel_web_server/trip_activities/${tripId}`,
    destinations: `http://localhost/travel_web_server/trip_destinations/${tripId}`,
    transportations: `http://localhost/travel_web_server/trip_transportations/trip/${tripId}`,
    interests: `http://localhost/travel_web_server/trip_interests/trip/${tripId}`,
    addons: `http://localhost/travel_web_server/trip_addons/trip/${tripId}`,
    amenities: `http://localhost/travel_web_server/trip_amenities/trip/${tripId}`,
  };

  const responses = await Promise.all(
    Object.values(urls).map((url) => fetch(url).then((res) => res.json()))
  );
  const [
    plan,
    activities,
    destinations,
    transportations,
    interests,
    addons,
    amenities,
  ] = responses;

  let user = null;
  if (plan && plan.user_id) {
    const userRes = await fetch(
      `http://localhost/travel_web_server/users/${plan.user_id}`
    );
    if (userRes.ok) {
      user = await userRes.json();
    }
  }

  return {
    plan,
    user,
    activities,
    destinations,
    transportations,
    interests,
    addons,
    amenities,
  };
}

export default function TripPlansPage() {
  const [allPlans, setAllPlans] = useState<TripPlan[]>([]);
  const [customPlans, setCustomPlans] = useState<TripPlan[]>([]);
  const [prePlans, setPrePlans] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState<TripPlanDetails | null>(null);

  const fetchTripPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost/travel_web_server/trip_plans"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trip plans");
      }
      const data = await response.json();
      if(Array.isArray(data)) {
        setAllPlans(data);
        setCustomPlans(data.filter(p => p.plan_type === 'custom-plan'));
        setPrePlans(data.filter(p => p.plan_type === 'pre-plan'));
      } else {
        setAllPlans([]);
        setCustomPlans([]);
        setPrePlans([]);
      }
    } catch (error) {
      console.error("Error fetching trip plans:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load trip plans.",
      });
      setAllPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripPlans();
  }, []);

  const handleRowClick = async (planId: number) => {
    if (selectedPlanId === planId) {
      setSelectedPlanId(null);
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
          description: "Could not load trip plan details.",
        });
      } finally {
        setIsDetailsLoading(false);
      }
    }
  };
  
  const calculateDuration = (from: string, to: string) => {
    if (!from || !to) return null;
    const fromDate = new Date(from.replace(" ", "T"));
    const toDate = new Date(to.replace(" ", "T"));
    const duration = differenceInDays(toDate, fromDate) + 1;
    return duration > 0 ? duration : null;
  };
  
  const calculateCostPerPerson = (plan: TripPlan) => {
    const totalTravelers = (plan.adults || 0) + (plan.children || 0);
    const estimatedCost = parseFloat(plan.estimated_cost);
    if (totalTravelers > 0 && estimatedCost > 0) {
        return (estimatedCost / totalTravelers).toFixed(2);
    }
    return null;
  };

  const renderPlanTable = (plans: TripPlan[], tableType: 'Custom' | 'Pre-plan') => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Trip Dates</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Travelers</TableHead>
            <TableHead>Budget Range (LKR)</TableHead>
            <TableHead>Estimated Cost (LKR)</TableHead>
            {tableType === 'Pre-plan' && <TableHead>Cost Per Person (LKR)</TableHead>}
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => {
            const duration = calculateDuration(plan.from_date, plan.to_date);
            const costPerPerson = tableType === 'Pre-plan' ? calculateCostPerPerson(plan) : null;
            return (
              <React.Fragment key={plan.id}>
                <TableRow
                  onClick={() => handleRowClick(plan.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {plan.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {plan.from_date && plan.to_date
                      ? `${format(
                          new Date(plan.from_date.replace(" ", "T")),
                          "MMM d, yyyy"
                        )} - ${format(
                          new Date(plan.to_date.replace(" ", "T")),
                          "MMM d, yyyy"
                        )}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{duration ? `${duration} days` : "N/A"}</TableCell>
                  <TableCell>
                    {plan.adults} Adults
                    {plan.children > 0 &&
                      `, ${plan.children} Children`}
                    {plan.infants > 0 &&
                      `, ${plan.infants} Infants`}
                  </TableCell>
                  <TableCell>
                    {plan.budget_range ? `${plan.budget_range}` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {plan.estimated_cost
                      ? parseFloat(plan.estimated_cost).toFixed(2)
                      : "N/A"}
                  </TableCell>
                  {tableType === 'Pre-plan' && (
                    <TableCell>{costPerPerson || 'N/A'}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          selectedPlanId === plan.id ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </TableCell>
                </TableRow>

                {selectedPlanId === plan.id && (
                  <TableRow key={`details-${plan.id}`}>
                    <TableCell colSpan={tableType === 'Pre-plan' ? 9 : 8}>
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
                                <CardTitle className="text-lg">
                                  Customer Details
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                <p>
                                  <strong>Name:</strong>{" "}
                                  {planDetails.user?.full_name}
                                </p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {planDetails.user?.email}
                                </p>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  {planDetails.user?.phone_number}
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="flex flex-row items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                  Trip Overview
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                {planDetails.plan?.from_date &&
                                  planDetails.plan?.to_date && (
                                    <p>
                                      <strong>Dates:</strong>{" "}
                                      {`${format(
                                        new Date(
                                          planDetails.plan.from_date.replace(
                                            " ",
                                            "T"
                                          )
                                        ),
                                        "MMM d, yyyy"
                                      )} - ${format(
                                        new Date(
                                          planDetails.plan.to_date.replace(
                                            " ",
                                            "T"
                                          )
                                        ),
                                        "MMM d, yyyy"
                                      )}`}
                                       (
                                        {calculateDuration(
                                          planDetails.plan.from_date,
                                          planDetails.plan.to_date
                                        )}{" "}
                                        days)
                                    </p>
                                  )}
                                <div>
                                  <strong>Travelers: </strong>
                                  {planDetails.plan?.adults}{" "}
                                  Adults
                                  {planDetails.plan?.children &&
                                  planDetails.plan.children > 0
                                    ? `, ${planDetails.plan.children} Children`
                                    : ""}
                                  {planDetails.plan?.infants &&
                                  planDetails.plan.infants > 0
                                    ? `, ${planDetails.plan.infants} Infants`
                                    : ""}
                                </div>
                                <Separator/>
                                <div>
                                  <strong>Interests:</strong>{" "}
                                  {(
                                    Array.isArray(planDetails.interests)
                                      ? planDetails.interests
                                      : [planDetails.interests].filter(
                                          Boolean
                                        )
                                  )
                                    .map((i: any) => i?.interest_name)
                                    .join(", ")}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Budget and Cost Card */}
                            <Card>
                              <CardHeader className="flex flex-row items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                  Budget & Cost
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                <p>
                                  <strong>Budget Range (LKR):</strong>{" "}
                                  {planDetails.plan?.budget_range || "N/A"}
                                </p>
                                <p>
                                  <strong>Estimated Cost (LKR):</strong>{" "}
                                  {planDetails.plan?.estimated_cost
                                    ? parseFloat(
                                        planDetails.plan.estimated_cost
                                      ).toFixed(2)
                                    : "N/A"}
                                </p>
                                {planDetails.plan?.plan_type === 'pre-plan' && (
                                    <p>
                                        <strong>Cost Per Person (LKR):</strong>{" "}
                                        {calculateCostPerPerson(planDetails.plan) || 'N/A'}
                                    </p>
                                )}
                              </CardContent>
                            </Card>
                             <Card>
                              <CardHeader className="flex flex-row items-center gap-2">
                                <Bus className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                  Transport
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">
                                  {planDetails.transportations?.[0]
                                    ?.transport_method ||
                                    "Not specified"}
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Destinations & Activities */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader className="flex flex-row items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Destinations</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside text-sm">
                                  {(Array.isArray(planDetails.destinations) ? planDetails.destinations : [planDetails.destinations].filter(Boolean))?.map(
                                    (d: any, idx: number) => (
                                      <li
                                        key={
                                          d?.id ??
                                          `dest-${
                                            d?.destination_name ??
                                            "unknown"
                                          }-${idx}`
                                        }
                                      >
                                        {d?.destination_name}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="flex flex-row items-center gap-2"><Star className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Activities</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside text-sm">
                                  {planDetails.activities?.map(
                                    (a: any, idx: number) => (
                                      <li
                                        key={
                                          a?.id ??
                                          `act-${
                                            a?.activity_name ?? "unknown"
                                          }-${idx}`
                                        }
                                      >
                                        {a?.activity_name}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Accommodation, Addons */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader className="flex flex-row items-center gap-2"><Bed className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Accommodation</CardTitle></CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm">
                                  {planDetails.plan?.accommodation_type && (
                                      <div>
                                          <strong>Type:</strong>{" "}
                                          <Badge variant="secondary">{planDetails.plan.accommodation_type}</Badge>
                                      </div>
                                  )}
                                  {planDetails.amenities && planDetails.amenities.length > 0 && (
                                    <div>
                                      <strong>Amenities:</strong>
                                      <ul className="list-disc list-inside mt-1">
                                          {planDetails.amenities?.map(
                                          (a: any, idx: number) => (
                                              <li
                                              key={
                                                  a?.id ??
                                                  `amenity-${
                                                  a?.amenity_name ?? "unknown"
                                                  }-${idx}`
                                              }
                                              >
                                              {a?.amenity_name}
                                              </li>
                                          )
                                          )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="flex flex-row items-center gap-2"><Plus className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Add-ons</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside text-sm">
                                  {planDetails.addons?.map(
                                    (a: any, idx: number) => (
                                      <li
                                        key={
                                          a?.id ??
                                          `addon-${
                                            a?.addon_name ?? "unknown"
                                          }-${idx}`
                                        }
                                      >
                                        {a?.addon_name}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Additional Comments */}
                          {planDetails.plan?.additional_requests && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  Additional Client Requests
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  {planDetails.plan.additional_requests}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    )
  }

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
        <h1 className="text-3xl font-bold font-headline text-foreground">
          Client Trip Plans
        </h1>
        <Button asChild>
          <Link href="/admin/tripplans/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Plan
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-xl">
              All Submitted Plans
            </CardTitle>
            <CardDescription>
              Review custom trip itineraries submitted by your clients and pre-plans created by admins.
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Tabs defaultValue="custom">
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
              <TabsTrigger value="custom">Custom Plans</TabsTrigger>
              <TabsTrigger value="pre-plan">Pre-plans</TabsTrigger>
            </TabsList>
            <TabsContent value="custom" className="mt-4">
               {customPlans.length > 0 ? (
                renderPlanTable(customPlans, 'Custom')
               ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Plane className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg">No custom plans found.</p>
                  <p>When clients create plans from the front-end, they will appear here.</p>
                </div>
               )}
            </TabsContent>
            <TabsContent value="pre-plan" className="mt-4">
              {prePlans.length > 0 ? (
                renderPlanTable(prePlans, 'Pre-plan')
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Plane className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg">No pre-plans found.</p>
                  <p>Use the "Create Plan" button to add a new pre-planned itinerary.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
