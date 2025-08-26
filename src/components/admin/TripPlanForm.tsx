
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowRight, Info, MapPin, Search, Calendar as CalendarIcon, Users, Minus, Plus, ArrowLeft, Check, Shield, Accessibility, Edit, Compass, MessageSquare, Diamond, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { destinations as hardcodedDestinations } from '@/lib/destinations';
import { useToast } from "@/hooks/use-toast";
import type { ApiDestination, Destination, Activity as ActivityType, User } from '@/lib/types';


const steps = [
  { id: 1, name: 'Destination & Dates' },
  { id: 2, name: 'Interests' },
  { id: 3, name: 'Pace' },
  { id: 4, name: 'Accommodation' },
  { id: 5, name: 'Transportation' },
  { id: 6, name: 'Finish' },
];

const interests = [
    { name: 'Adventure', image: 'https://placehold.co/400x500.png', aiHint: 'river rafting' },
    { name: 'Culture', image: 'https://placehold.co/400x500.png', aiHint: 'traditional dancer' },
    { name: 'Relaxation', image: 'https://placehold.co/400x500.png', aiHint: 'woman relaxing' },
    { name: 'Food', image: 'https://placehold.co/400x500.png', aiHint: 'food platter' },
    { name: 'City Exploration', image: 'https://placehold.co/400x500.png', aiHint: 'city skyline' },
    { name: 'Nature', image: 'https://placehold.co/400x500.png', aiHint: 'mountain landscape' },
];

const accommodationTypes = [
  { name: 'Hotel', image: 'https://placehold.co/400x300.png', aiHint: 'luxury hotel' },
  { name: 'Resort', image: 'https://placehold.co/400x300.png', aiHint: 'beach resort' },
  { name: 'Rental', image: 'https://placehold.co/400x300.png', aiHint: 'vacation rental' },
  { name: 'Village Home', image: 'https://placehold.co/400x300.png', aiHint: 'village house' },
  { name: 'Camping', image: 'https://placehold.co/400x300.png', aiHint: 'camping tent' },
];

const budgetRanges = [
    'Less than LKR 3000',
    'LKR 3000-5000',
    'LKR 5000-8000',
    'LKR 8000-10,000',
    'LKR 10,000 to Above',
];

const amenities = [
  { name: 'Free WiFi', image: 'https://placehold.co/200x200.png', aiHint: 'wifi symbol' },
  { name: 'Pool', image: 'https://placehold.co/200x200.png', aiHint: 'swimming pool' },
  { name: 'Parking', image: 'https://placehold.co/200x200.png', aiHint: 'parking sign' },
  { name: 'Breakfast', image: 'https://placehold.co/200x200.png', aiHint: 'breakfast food' },
  { name: 'Pet-friendly', image: 'https://placehold.co/200x200.png', aiHint: 'dog cat' },
  { name: 'Gym', image: 'https://placehold.co/200x200.png', aiHint: 'gym equipment' },
];

const transportationOptions = [
    { name: 'Flights', image: 'https://placehold.co/400x300.png', aiHint: 'airplane sky' },
    { name: 'Rental Car', image: 'https://placehold.co/400x300.png', aiHint: 'rental car' },
    { name: 'Public Transport', image: 'https://placehold.co/400x300.png', aiHint: 'public bus' },
    { name: 'Rental Bike', image: 'https://placehold.co/400x300.png', aiHint: 'scooter rental' },
    { name: 'Rental Van', image: 'https://placehold.co/400x300.png', aiHint: 'rental van' },
    { name: 'Rental Bus', image: 'https://placehold.co/400x300.png', aiHint: 'tour bus' },
];

const optionalAddons = [
    { name: 'Travel Insurance', icon: <Shield /> },
    { name: 'Accessibility Needs', icon: <Accessibility /> },
]

type CombinedDestination = Destination | ApiDestination;

export interface TripPlanFormData {
  company_id: string | number;
  user_id: string | number;
  from_date: string | null;
  to_date: string | null;
  adults: number;
  children: number;
  infants: number;
  accommodation_type: string | null;
  budget_range: string | null;
  status: string;
  estimated_cost: number;
  destinations: { id: string | number; name: string }[];
  interests: string[];
  activities: { name: string }[];
  amenities: string[];
  addons: string[];
  transportation: string[];
  full_name: string;
  email: string;
}


interface TripPlanFormProps {
  onSubmitForm: (data: TripPlanFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function TripPlanForm({ onSubmitForm, isSubmitting = false }: TripPlanFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [isFromDatePickerOpen, setIsFromDatePickerOpen] = useState(false);
  const [isToDatePickerOpen, setIsToDatePickerOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedTransportation, setSelectedTransportation] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState<CombinedDestination[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<CombinedDestination[]>([]);
  const [allDestinations, setAllDestinations] = useState<CombinedDestination[]>([]);
  const [isDestinationListOpen, setIsDestinationListOpen] = useState(false);
  const [allActivities, setAllActivities] = useState<ActivityType[]>([]);
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  
  const [allUsers, setAllUsers] = useState<User[]>([]);


  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [destRes, actRes, usersRes] = await Promise.all([
                fetch('http://localhost/travel_web_server/destinations'),
                fetch('http://localhost/travel_web_server/activities'),
                fetch('http://localhost/travel_web_server/users')
            ]);
            
            const apiDestData = await destRes.json();
            const combinedDest: CombinedDestination[] = [...hardcodedDestinations];
            if (Array.isArray(apiDestData)) {
                apiDestData.forEach((apiDest: ApiDestination) => {
                    if (!hardcodedDestinations.some(hd => hd.id === apiDest.id.toString())) {
                        combinedDest.push(apiDest);
                    }
                });
            }
            setAllDestinations(combinedDest);
            setFilteredDestinations(combinedDest);

            const actData = await actRes.json();
            if(Array.isArray(actData)) {
                setAllActivities(actData);
            }

            const usersData = await usersRes.json();
             if(Array.isArray(usersData)) {
                setAllUsers(usersData);
            }

        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load required data for the form.",
            });
            // Fallback for destinations
            setAllDestinations(hardcodedDestinations);
            setFilteredDestinations(hardcodedDestinations);
        }
    };
    
    fetchInitialData();
  }, [toast]);

  const groupedActivities = useMemo(() => {
    return allActivities.reduce((acc, activity) => {
        const category = 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(activity);
        return acc;
    }, {} as Record<string, ActivityType[]>);
  }, [allActivities]);

  const getImageUrl = (url: string | null) => {
    const baseUrl = 'https://content-provider.payshia.com/travel-web';
    if (!url) return 'https://placehold.co/400x300.png';
    if (url.startsWith('http')) return url;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const estimatedCost = useMemo(() => {
    let totalCost = 0;
    const numberOfTravelers = adults + children;
    const tripDuration = (fromDate && toDate) ? differenceInDays(toDate, fromDate) + 1 : 1;

    if (selectedAccommodation && selectedBudget) {
        const budgetMap: { [key: string]: number } = {
            'Less than LKR 3000': 2000,
            'LKR 3000-5000': 4000,
            'LKR 5000-8000': 6500,
            'LKR 8000-10,000': 9000,
            'LKR 10,000 to Above': 12000,
        };
        totalCost += (budgetMap[selectedBudget] || 0) * tripDuration;
    }

    totalCost += selectedActivities.length * 1500 * numberOfTravelers;

    const transportCostMap: { [key: string]: number } = {
        'Flights': 10000 * numberOfTravelers,
        'Rental Car': 5000 * tripDuration,
        'Public Transport': 500 * tripDuration * numberOfTravelers,
        'Rental Bike': 1000 * tripDuration,
        'Rental Van': 7000 * tripDuration,
        'Rental Bus': 10000 * tripDuration,
    };
    selectedTransportation.forEach(transport => {
        totalCost += transportCostMap[transport] || 0;
    });

    return totalCost;
  }, [selectedAccommodation, selectedBudget, selectedActivities, selectedTransportation, adults, children, fromDate, toDate]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = allDestinations.filter(dest =>
        dest.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations(allDestinations);
    }
    setIsDestinationListOpen(true);
  };

  const handleSelectDestination = (destination: CombinedDestination) => {
    const destId = 'hero_bg_image_url' in destination ? destination.id.toString() : destination.id;
    if (!selectedDestinations.find(d => ('hero_bg_image_url' in d ? d.id.toString() : d.id) === destId)) {
        setSelectedDestinations([...selectedDestinations, destination]);
    }
    setSearchQuery('');
    setFilteredDestinations(allDestinations);
    setIsDestinationListOpen(false);
  };

  const handleRemoveDestination = (destinationId: string | number) => {
    setSelectedDestinations(selectedDestinations.filter(d => ('hero_bg_image_url' in d ? d.id.toString() : d.id) !== destinationId.toString()));
  }

  const toggleInterest = (interestName: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestName) 
        ? prev.filter(item => item !== interestName)
        : [...prev, interestName]
    );
  };
  
  const toggleActivity = (activityName: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityName)
        ? prev.filter(item => item !== activityName)
        : [...prev, activityName]
    );
  };

  const toggleAmenity = (amenityName: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityName)
        ? prev.filter(item => item !== amenityName)
        : [...prev, amenityName]
    );
  };

  const toggleTransportation = (transportationName: string) => {
    setSelectedTransportation(prev =>
        prev.includes(transportationName)
            ? prev.filter(item => item !== transportationName)
            : [...prev, transportationName]
    );
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev =>
        prev.includes(addonName)
            ? prev.filter(item => item !== addonName)
            : [...prev, addonName]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length) {
      handleFinalizeTrip();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalizeTrip = async () => {
    const storedUserRaw = localStorage.getItem('loggedInUser');
    if (!storedUserRaw) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not find logged in user data. Please log in again.",
        });
        return;
    }
    
    let loggedInUser;
    try {
        loggedInUser = JSON.parse(storedUserRaw);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Session Error",
            description: "Could not read user data. Please log in again.",
        });
        return;
    }

    if (!loggedInUser || !loggedInUser.company_id) {
         toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Company ID is missing from your profile. Please log in again.",
        });
        return;
    }

    const adminUser = allUsers.find(u => 
        u.role === 'admin' && 
        (u as any).company_id?.toString() === loggedInUser.company_id.toString()
    );

    if (!adminUser) {
        toast({
            variant: "destructive",
            title: "Authorization Error",
            description: "Could not find a valid admin user for your company to create the plan.",
        });
        return;
    }

    const tripPlanData: TripPlanFormData = {
        company_id: loggedInUser.company_id, 
        user_id: adminUser.id,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : null,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : null,
        adults: adults,
        children: children,
        infants: infants,
        accommodation_type: selectedAccommodation,
        budget_range: selectedBudget,
        status: 'pending',
        estimated_cost: estimatedCost,
        destinations: selectedDestinations.map(dest => {
            const id = 'hero_bg_image_url' in dest ? dest.id : parseInt(dest.id.split('-')[1], 10);
            return { id: id, name: dest.name.split(',')[0].trim() };
        }),
        interests: selectedInterests,
        activities: selectedActivities.map(activity => ({ name: activity })),
        amenities: selectedAmenities,
        addons: selectedAddons,
        transportation: selectedTransportation,
        full_name: fullName,
        email: email,
    };
    
    await onSubmitForm(tripPlanData);
  };

  const NumberInput = ({ label, value, onDecrement, onIncrement, description }: { label: string, value: number, onDecrement: () => void, onIncrement: () => void, description: string }) => (
    <div className="bg-muted/50 p-4 rounded-lg flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center justify-center gap-4 mt-2">
            <Button size="icon" variant="outline" onClick={onDecrement} disabled={value <= (label === 'Adults' ? 1 : 0)}>
                <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold w-8 text-center">{value}</span>
            <Button size="icon" variant="outline" onClick={onIncrement}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
  
  const ActivityCard = ({ name, location, image, aiHint, isSelected, onSelect }: { name: string, location: string, image: string, aiHint: string, isSelected: boolean, onSelect: () => void }) => (
    <Card
      className={cn(
        "relative rounded-lg overflow-hidden cursor-pointer group border-2",
        isSelected ? 'border-primary' : 'border-transparent'
      )}
      onClick={onSelect}
    >
      <Image src={image} alt={name} width={400} height={300} className="h-48 w-full object-cover group-hover:scale-105 transition-transform" data-ai-hint={aiHint} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white bg-white/30 flex items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</p>
      </div>
    </Card>
  );

  return (
    <div className="bg-white text-foreground">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
            <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center">
                <div
                className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300',
                    currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
                >
                {step.id}
                </div>
                <p className={cn("text-xs mt-1", currentStep >= step.id ? 'text-primary' : 'text-muted-foreground')}>{step.name}</p>
            </div>
            {index < steps.length - 1 && (
                <div className={cn(
                "flex-1 h-0.5 transition-colors duration-300 mx-2",
                currentStep > step.id ? 'bg-primary' : 'bg-muted'
                )}></div>
            )}
            </React.Fragment>
        ))}
        </div>

        {(currentStep >= 2 && currentStep <= 5) && (
            <Card className="mb-8 bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-center gap-4">
                <Diamond className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                    {currentStep === 2 && "Select any ind of activity category and then you can choose specific activities in Next Step."}
                    {currentStep === 3 && "Select any ind of activities you want to Experience. (This suggestions based on Previous categories you chosen)"}
                    {currentStep === 4 && "Select any type accommodation and amenities."}
                    {currentStep === 5 && "We’ll help you figure out the best way for you to get around your destination."}
                </p>
            </CardContent>
        </Card>
        )}
        
        {currentStep === 1 && (
            <Card className="mb-8 bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-center gap-4">
                <Diamond className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                    Please note that it will take a minimum of 4 days for your selected options to be processed.
                </p>
            </CardContent>
        </Card>
        )}

        {/* Step Content */}
        <div className="p-8">
            {currentStep === 1 && (
            <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="font-semibold">Full Name</label>
                        <Input 
                            type="text" 
                            placeholder="Enter client's full name" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                     <div>
                        <label className="font-semibold">Email</label>
                        <Input 
                            type="email" 
                            placeholder="Enter client's email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div>
                <h2 className="text-2xl font-headline font-semibold flex items-center gap-2 mb-6">
                    <MapPin className="text-primary" />
                    Where do you want to go?
                </h2>
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search destinations (e.g., Kandy, Sigiriya)"
                        className="pl-10 text-base"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setIsDestinationListOpen(true)}
                        onBlur={() => setTimeout(() => setIsDestinationListOpen(false), 200)}
                    />
                    {isDestinationListOpen && (
                        <Card className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 overflow-y-auto">
                        <ul className="py-1">
                            {filteredDestinations.map(dest => (
                            <li
                                key={'hero_bg_image_url' in dest ? dest.id : dest.id}
                                className="px-4 py-2 cursor-pointer hover:bg-muted"
                                onMouseDown={() => handleSelectDestination(dest)}
                            >
                                {dest.name}
                            </li>
                            ))}
                        </ul>
                        </Card>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {selectedDestinations.map(dest => (
                        <Badge key={'hero_bg_image_url' in dest ? dest.id : dest.id} variant="secondary" className="text-base py-1 pl-3 pr-2">
                            {dest.name}
                            <button onClick={() => handleRemoveDestination('hero_bg_image_url' in dest ? dest.id : dest.id)} className="ml-2 rounded-full hover:bg-background/50">
                                <X className="h-4 w-4" />
                            </button>
                        </Badge>
                    ))}
                </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Click or start typing to see destination suggestions</span>
                </div>
                </div>

                <div>
                    <h2 className="text-2xl font-headline font-semibold flex items-center gap-2 mb-6">
                        <CalendarIcon className="text-primary" />
                        When do you plan to travel?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Popover open={isFromDatePickerOpen} onOpenChange={setIsFromDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("justify-start text-left font-normal h-12", !fromDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {fromDate ? format(fromDate, "MM/dd/yyyy") : <span>From</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={fromDate} onSelect={(date) => {setFromDate(date); setIsFromDatePickerOpen(false);}} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <Popover open={isToDatePickerOpen} onOpenChange={setIsToDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("justify-start text-left font-normal h-12", !toDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {toDate ? format(toDate, "MM/dd/yyyy") : <span>To</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={toDate} onSelect={(date) => {setToDate(date); setIsToDatePickerOpen(false);}} disabled={(date) => date < (fromDate || new Date())} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-headline font-semibold flex items-center gap-2 mb-6">
                        <Users className="text-primary" />
                        Who are you traveling with?
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="p-1">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Specify the number of travelers.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <NumberInput label="Adults" description="18+ years" value={adults} onDecrement={() => setAdults(v => v > 1 ? v-1 : 1)} onIncrement={() => setAdults(v => v+1)} />
                        <NumberInput label="Children" description="2-17 years" value={children} onDecrement={() => setChildren(v => v > 0 ? v - 1 : 0)} onIncrement={() => setChildren(v => v + 1)} />
                        <NumberInput label="Infants" description="Under 2" value={infants} onDecrement={() => setInfants(v => v > 0 ? v - 1 : 0)} onIncrement={() => setInfants(v => v + 1)} />
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                <Button onClick={handleNext}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
            )}
            {currentStep === 2 && (
            <div>
                <h2 className="text-2xl font-headline font-semibold mb-2">What do you want to do?</h2>
                <p className="text-muted-foreground mb-6">Select the activities you're most interested in. This helps us tailor your trip to your preferences.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => (
                    <Card 
                    key={interest.name} 
                    className={cn(
                        "relative rounded-lg overflow-hidden cursor-pointer group border-2",
                        selectedInterests.includes(interest.name) ? 'border-primary' : 'border-transparent'
                    )}
                    onClick={() => toggleInterest(interest.name)}
                    >
                    <Image src={interest.image} alt={interest.name} width={400} height={500} className="h-48 w-full object-cover group-hover:scale-105 transition-transform" data-ai-hint={interest.aiHint} />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white bg-white/30 flex items-center justify-center">
                        {selectedInterests.includes(interest.name) && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-white font-bold text-lg">{interest.name}</h3>
                    </div>
                    </Card>
                ))}
                </div>

                <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
            )}
            {currentStep === 3 && (
            <div>
                <h2 className="text-2xl font-headline font-semibold mb-2">What do you want to Experience?</h2>
                <p className="text-muted-foreground mb-6">Select the activities you're most interested in. This helps us tailor your trip to your preferences.</p>
                
                <div className="space-y-8">
                {Object.entries(groupedActivities)
                    .map(([category, activities]) => (
                    <div key={category}>
                        <h3 className="text-xl font-semibold mb-4">{category} Activities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {activities.map((activity) => (
                            <ActivityCard 
                                key={activity.id}
                                name={activity.name}
                                location={activity.location}
                                image={getImageUrl(activity.image_url)}
                                aiHint={activity.name.toLowerCase()}
                                isSelected={selectedActivities.includes(activity.name)}
                                onSelect={() => toggleActivity(activity.name)}
                            />
                            ))}
                        </div>
                    </div>
                ))}
                </div>

                <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
            )}
            {currentStep === 4 && (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-headline font-semibold mb-2">Where to Stay?</h2>
                    <p className="text-muted-foreground mb-6">Select what kind of accommodation do you want.</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {accommodationTypes.map((type) => (
                            <Card 
                                key={type.name} 
                                className={cn(
                                    "relative rounded-lg overflow-hidden cursor-pointer group border-2",
                                    selectedAccommodation === type.name ? 'border-primary' : 'border-transparent'
                                )}
                                onClick={() => setSelectedAccommodation(type.name)}
                            >
                                <Image src={type.image} alt={type.name} width={400} height={300} className="h-32 w-full object-cover group-hover:scale-105 transition-transform" data-ai-hint={type.aiHint} />
                                <div className="absolute inset-0 bg-black/40" />
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white bg-white/30 flex items-center justify-center">
                                    {selectedAccommodation === type.name && <Check className="h-4 w-4 text-white" />}
                                </div>
                                <div className="absolute bottom-0 left-0 p-2">
                                    <h3 className="text-white font-bold text-base">{type.name}</h3>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Budget Range</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {budgetRanges.map((range) => (
                            <Button 
                                key={range} 
                                variant={selectedBudget === range ? "default" : "outline"}
                                onClick={() => setSelectedBudget(range)}
                                className="justify-start"
                            >
                                {range}
                            </Button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {amenities.map((amenity) => (
                            <Card 
                                key={amenity.name} 
                                className={cn(
                                    "relative rounded-lg overflow-hidden cursor-pointer group border-2",
                                    selectedAmenities.includes(amenity.name) ? 'border-primary' : 'border-transparent'
                                )}
                                onClick={() => toggleAmenity(amenity.name)}
                            >
                                <Image src={amenity.image} alt={amenity.name} width={200} height={200} className="h-24 w-full object-cover" data-ai-hint={amenity.aiHint}/>
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-white bg-white/30 flex items-center justify-center">
                                    {selectedAmenities.includes(amenity.name) && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <h3 className="text-white font-semibold text-sm">{amenity.name}</h3>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
            )}
            {currentStep === 5 && (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-headline font-semibold mb-2">How will you get around?</h2>
                    <p className="text-muted-foreground mb-6">Select your preferred mode of transportation.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {transportationOptions.map((option) => (
                            <Card
                                key={option.name}
                                className={cn(
                                    "relative rounded-lg overflow-hidden cursor-pointer group border-2",
                                    selectedTransportation.includes(option.name) ? 'border-primary' : 'border-transparent'
                                )}
                                onClick={() => toggleTransportation(option.name)}
                            >
                                <Image src={option.image} alt={option.name} width={400} height={300} className="h-32 w-full object-cover group-hover:scale-105 transition-transform" data-ai-hint={option.aiHint} />
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white bg-white/30 flex items-center justify-center">
                                    {selectedTransportation.includes(option.name) && <Check className="h-4 w-4 text-white" />}
                                </div>
                                <div className="absolute bottom-0 left-0 p-2">
                                    <h3 className="text-white font-bold text-base">{option.name}</h3>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Optional</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {optionalAddons.map((addon) => (
                            <Button
                                key={addon.name}
                                variant={selectedAddons.includes(addon.name) ? 'default' : 'outline'}
                                onClick={() => toggleAddon(addon.name)}
                                className="w-full justify-center text-base py-6"
                            >
                                {addon.icon}
                                <span>{addon.name}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
            )}
            {currentStep === 6 && (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-headline font-semibold mb-2">Your Trip Summary</h2>
                    <p className="text-muted-foreground mb-6">Review your selections and make adjustments before finalizing your trip.</p>
                </div>

                <div className="space-y-6">
                        {selectedDestinations.length > 0 && (
                        <>
                            <h3 className="text-xl font-semibold">Destinations</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedDestinations.map(dest => (
                                    <Badge key={'hero_bg_image_url' in dest ? dest.id : dest.id} variant="secondary" className="text-base py-1 px-3">
                                        {dest.name}
                                    </Badge>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {selectedAccommodation && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Accommodation</h3>
                        <Card className="flex flex-col md:flex-row items-center gap-6 p-4">
                            <div className="flex-grow">
                                <Badge>{selectedAccommodation}</Badge>
                                <h4 className="font-semibold text-lg mt-2">Hotel with stunning mountain views, perfect for a peaceful getaway</h4>
                                {selectedBudget && <p className="text-sm font-semibold mt-1">{selectedBudget}</p>}
                                {selectedAmenities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedAmenities.map(amenity => <Badge key={amenity} variant="secondary">{amenity}</Badge>)}
                                </div>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentStep(4)}><Edit className="h-4 w-4" /></Button>
                        </Card>
                    </div>
                )}
                
                {selectedActivities.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Activities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedActivities.map(activityName => {
                                const activity = allActivities.find(a => a.name === activityName);
                                return activity ? <ActivityCard key={activity.id} name={activity.name} location={activity.location} image={getImageUrl(activity.image_url)} aiHint={activity.name.toLowerCase()} isSelected={true} onSelect={() => {}} /> : null;
                            })}
                        </div>
                    </div>
                )}

                {selectedTransportation.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Transportation</h3>
                        <Card className="flex flex-col md:flex-row items-center gap-6 p-4">
                            <div className="flex-grow">
                                <Badge>{selectedTransportation.join(', ')}</Badge>
                                <h4 className="font-semibold text-lg mt-2">Compact car, great for city navigation and flexibility during your trip</h4>
                                <p className="text-sm font-semibold mt-1">Less than LKR 3000</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentStep(5)}><Edit className="h-4 w-4" /></Button>
                        </Card>
                    </div>
                )}

                <div className="space-y-4 pt-8 border-t">
                    <h3 className="text-xl font-semibold">Estimated Cost</h3>
                    <p className="text-3xl font-bold">
                        Total LKR {estimatedCost.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground"> (This is an estimate only based on final selections and availability.)</span>
                    </p>
                </div>


                <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finalizing...
                            </>
                        ) : 'Finalize Trip'}
                    </Button>
                </div>
            </div>
            )}
        </div>
    </div>
  );
}

