
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Activity } from "@/lib/types";

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
    budget_range_costs: Record<string, number>;
    activity_costs: Record<string, number>;
    transportation_costs: Record<string, number>;
    amenity_costs: Record<string, number>;
}

export default function CostingPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [costing, setCosting] = useState<CostingState>({
        budget_range_costs: {},
        activity_costs: {},
        transportation_costs: {},
        amenity_costs: {}
    });
    const [settingsId, setSettingsId] = useState<number | null>(null);

    const [allActivities, setAllActivities] = useState<Activity[]>([]);

    const companyId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('loggedInUser') || '{}').company_id : null;

    useEffect(() => {
        const fetchCostSettings = async () => {
            if (!companyId) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost/travel_web_server/cost_settings');
                if (!response.ok) throw new Error("Failed to fetch cost settings.");
                
                const allSettings = await response.json();
                if (Array.isArray(allSettings)) {
                    const companySettings = allSettings.find(s => s.company_id.toString() === companyId.toString());
                    if (companySettings) {
                        setCosting({
                            budget_range_costs: companySettings.budget_range_costs || {},
                            activity_costs: companySettings.activity_costs || {},
                            transportation_costs: companySettings.transportation_costs || {},
                            amenity_costs: companySettings.amenity_costs || {},
                        });
                        setSettingsId(companySettings.id);
                    } else {
                        // Initialize with default empty state if no settings found for company
                        setCosting({
                            budget_range_costs: budgetRanges.reduce((acc, range) => ({ ...acc, [range]: 0 }), {}),
                            activity_costs: {},
                            transportation_costs: transportationOptions.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}),
                            amenity_costs: amenities.reduce((acc, amenity) => ({ ...acc, [amenity]: 0 }), {})
                        });
                        setSettingsId(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching cost settings:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load costing settings from server.",
                });
            }
        };

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
        
        if (companyId) {
            fetchCostSettings();
            fetchActivities();
        }

        setIsLoading(false);
    }, [companyId, toast]);

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
        if (!companyId) {
            toast({ variant: "destructive", title: "Error", description: "Company ID not found. Please log in again."});
            return;
        }
        setIsSubmitting(true);

        const payload = {
            company_id: companyId,
            ...costing,
        };

        try {
            const url = settingsId 
                ? `http://localhost/travel_web_server/cost_settings/${settingsId}`
                : 'http://localhost/travel_web_server/cost_settings';
            
            const method = settingsId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save settings. Server responded with ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.id && !settingsId) {
                setSettingsId(result.id);
            }

            toast({
                title: "Success",
                description: "Costing settings have been saved successfully.",
            });

        } catch (error) {
            console.error("Failed to save costing:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Error",
                description: `Could not save costing settings: ${errorMessage}`,
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
                                value={costing.budget_range_costs[range] || ""}
                                onChange={(e) => handleCostChange('budget_range_costs', range, e.target.value)}
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
                                value={costing.amenity_costs[amenity] || ""}
                                onChange={(e) => handleCostChange('amenity_costs', amenity, e.target.value)}
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
                                value={costing.activity_costs[activity.name] || ""}
                                onChange={(e) => handleCostChange('activity_costs', activity.name, e.target.value)}
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
                                value={costing.transportation_costs[option] || ""}
                                onChange={(e) => handleCostChange('transportation_costs', option, e.target.value)}
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
