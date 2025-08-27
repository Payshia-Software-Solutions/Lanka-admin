
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Activity } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const COSTING_STORAGE_KEY = "LANKA_ADMIN_COSTING";

const budgetRanges = [
    'Less than LKR 3000',
    'LKR 3000-5000',
    'LKR 5000-8000',
    'LKR 8000-10,000',
    'LKR 10,000 to Above',
];

const transportationOptions = [
    'Flights',
    'Rental Car',
    'Public Transport',
    'Rental Bike',
    'Rental Van',
    'Rental Bus',
];

const amenities = [
  'Free WiFi',
  'Pool',
  'Parking',
  'Breakfast',
  'Pet-friendly',
  'Gym',
];


interface CostingState {
    budgetRanges: Record<string, number>;
    activities: Record<string, number>;
    transportation: Record<string, number>;
    amenities: Record<string, number>;
}

export default function CostingPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [costing, setCosting] = useState<CostingState>({
        budgetRanges: {},
        activities: {},
        transportation: {},
        amenities: {}
    });

    const [allActivities, setAllActivities] = useState<Activity[]>([]);

    useEffect(() => {
        setIsLoading(true);
        if (typeof window !== 'undefined') {
            // Load costing from localStorage
            const savedCosting = localStorage.getItem(COSTING_STORAGE_KEY);
            if (savedCosting) {
                setCosting(JSON.parse(savedCosting));
            } else {
                // Initialize default costing if none is saved
                const defaultCosting: CostingState = {
                    budgetRanges: budgetRanges.reduce((acc, range) => ({ ...acc, [range]: 0 }), {}),
                    activities: {},
                    transportation: transportationOptions.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}),
                    amenities: amenities.reduce((acc, amenity) => ({ ...acc, [amenity]: 0 }), {})
                };
                setCosting(defaultCosting);
            }
            
            // Fetch activities from API
            const fetchActivities = async () => {
                try {
                    const response = await fetch("http://localhost/travel_web_server/activities");
                    if (!response.ok) throw new Error("Failed to fetch activities");
                    const data = await response.json();
                    if(Array.isArray(data)) {
                        setAllActivities(data);
                    }
                } catch (error) {
                    console.error("Error fetching activities:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load activities for costing.",
                    });
                }
            };

            fetchActivities();
        }
        setIsLoading(false);
    }, [toast]);

    const handleCostChange = (category: keyof CostingState, key: string, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setCosting(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: numericValue
            }
        }));
    };

    const handleSaveCosting = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if(typeof window !== 'undefined') {
                localStorage.setItem(COSTING_STORAGE_KEY, JSON.stringify(costing));
                toast({
                    title: "Success",
                    description: "Costing settings have been saved successfully.",
                });
            }
        } catch (error) {
            console.error("Failed to save costing:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save costing settings.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading costing data...</p>
          </div>
        );
    }

    return (
        <form onSubmit={handleSaveCosting} className="space-y-8">
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline text-foreground">
                Cost Management
                </h1>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Save All Costs"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Accommodation & Budget Costs</CardTitle>
                    <CardDescription>Set the per-day cost for different accommodation budget ranges.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgetRanges.map(range => (
                        <div key={range} className="space-y-2">
                            <Label htmlFor={`budget-${range}`}>{range}</Label>
                            <Input 
                                id={`budget-${range}`}
                                type="number"
                                placeholder="e.g., 5000"
                                value={costing.budgetRanges[range] || ""}
                                onChange={(e) => handleCostChange('budgetRanges', range, e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Amenity Costs</CardTitle>
                    <CardDescription>Set additional costs for each amenity, if any.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {amenities.map(amenity => (
                        <div key={amenity} className="space-y-2">
                            <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                            <Input 
                                id={`amenity-${amenity}`}
                                type="number"
                                placeholder="e.g., 500"
                                value={costing.amenities[amenity] || ""}
                                onChange={(e) => handleCostChange('amenities', amenity, e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Costs</CardTitle>
                    <CardDescription>Set the cost per person for each available activity.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allActivities.length > 0 ? allActivities.map(activity => (
                         <div key={activity.id} className="space-y-2">
                            <Label htmlFor={`activity-${activity.id}`}>{activity.name}</Label>
                            <Input 
                                id={`activity-${activity.id}`}
                                type="number"
                                placeholder="e.g., 2500"
                                value={costing.activities[activity.name] || ""}
                                onChange={(e) => handleCostChange('activities', activity.name, e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    )) : (
                        <p className="text-muted-foreground col-span-full text-center">No activities found. Please add activities first.</p>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Transportation Costs</CardTitle>
                    <CardDescription>Set the per-day cost for different transportation types.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {transportationOptions.map(option => (
                        <div key={option} className="space-y-2">
                            <Label htmlFor={`transport-${option}`}>{option}</Label>
                            <Input 
                                id={`transport-${option}`}
                                type="number"
                                placeholder="e.g., 7000"
                                value={costing.transportation[option] || ""}
                                onChange={(e) => handleCostChange('transportation', option, e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

             <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Save All Costs"}
                </Button>
            </div>
        </form>
    )
}
