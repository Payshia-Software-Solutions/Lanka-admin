
"use client";

import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Sun,
  Wind,
  Mountain,
  Utensils,
  Camera,
  Star,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/lib/types";

const LOCAL_STORAGE_DESTINATIONS_KEY = "LANKA_ADMIN_DESTINATIONS";

const thingToDoSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  imageUrl: z.string().url("Please enter a valid URL."),
  icon: z.string().min(1, "Please select an icon."),
});

const destinationSchema = z.object({
  heroHeading: z.string().min(3, "Hero heading is required.").default(''),
  heroSubheading: z.string().min(3, "Hero sub-heading is required.").default(''),
  heroBgImageUrl: z.string().url("Please enter a valid background image URL.").default(''),
  
  introHeading: z.string().min(3, "Intro heading is required.").default(''),
  introDescription: z.string().min(10, "Intro description must be at least 10 characters.").default(''),
  introImageUrl: z.string().url("Please enter a valid intro image URL.").default(''),

  galleryImageUrls: z.array(z.object({ url: z.string().url("Please enter a valid URL.") })).default([]),

  thingsToDo: z.array(thingToDoSchema).default([]),

  nearbyAttractions: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  
  travelTipHeading: z.string().min(3, "Travel tip heading is required.").default(''),
  travelTipIcon: z.string().min(1, "Please select an icon.").default(''),
  travelTipDescription: z.string().min(10, "Travel tip description is required.").default(''),
  
  // Also include original Destination fields
  name: z.string().min(3, "Name must be at least 3 characters long."),
  websiteId: z.string().min(1, "Website ID is required."),
  location: z.string().min(3, "Location is required."),
  description: z.string().optional(), // for compatibility with existing type
});

type DestinationFormData = z.infer<typeof destinationSchema>;

const ICONS = [
  { value: "Sun", icon: Sun },
  { value: "Wind", icon: Wind },
  { value: "Mountain", icon: Mountain },
  { value: "Utensils", icon: Utensils },
  { value: "Camera", icon: Camera },
  { value: "Star", icon: Star },
];

export default function NewDestinationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      heroHeading: "",
      heroSubheading: "",
      heroBgImageUrl: "",
      introHeading: "",
      introDescription: "",
      introImageUrl: "",
      galleryImageUrls: [{ url: "" }],
      thingsToDo: [],
      nearbyAttractions: [],
      travelTipHeading: "",
      travelTipIcon: "Star",
      travelTipDescription: "",
      name: "",
      websiteId: "",
      location: "",
    },
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "galleryImageUrls",
  });
  
  const { fields: thingsToDoFields, append: appendThingToDo, remove: removeThingToDo } = useFieldArray({
    control: form.control,
    name: "thingsToDo",
  });

  const handleSubmit = async (data: DestinationFormData) => {
    setIsSubmitting(true);
    
    // Map form data to the expected API structure
    const apiData = {
        company_id: parseInt(data.websiteId, 10),
        name: data.name,
        hero_heading: data.heroHeading,
        hero_subheading: data.heroSubheading,
        hero_bg_image_url: data.heroBgImageUrl,
        intro_heading: data.introHeading,
        description: data.introDescription,
        intro_image_url: data.introImageUrl,
        location: data.location,
        gallery_image_urls: data.galleryImageUrls.map(item => item.url),
        things_to_do: data.thingsToDo,
        nearby_attractions: data.nearbyAttractions,
        travel_tip_heading: data.travelTipHeading,
        travel_tip_icon: data.travelTipIcon,
        travel_tip_description: data.travelTipDescription,
        is_popular: true, // Defaulting to true as per example
    };

    try {
        const response = await fetch('http://localhost/travel_web_server/destinations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
        });

        if (response.ok) {
            const newDestination = await response.json();
            toast({
                title: "Destination Created!",
                description: `Successfully created "${newDestination.name}".`,
            });
            // Optionally, update localStorage if you still want to use it as a cache
            if (typeof window !== 'undefined') {
                const storedDestinationsRaw = localStorage.getItem(LOCAL_STORAGE_DESTINATIONS_KEY);
                let destinations: Destination[] = [];
                if (storedDestinationsRaw) {
                    destinations = JSON.parse(storedDestinationsRaw);
                }
                 const destinationForStorage: Destination = {
                    id: newDestination.id.toString(),
                    name: newDestination.name,
                    description: newDestination.description,
                    location: newDestination.location,
                    websiteId: newDestination.company_id.toString(),
                    images: [newDestination.hero_bg_image_url, newDestination.intro_image_url, ...newDestination.gallery_image_urls],
                };
                destinations.push(destinationForStorage);
                localStorage.setItem(LOCAL_STORAGE_DESTINATIONS_KEY, JSON.stringify(destinations));
            }
            router.push("/admin/destinations");
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create destination.');
        }

    } catch (error) {
        console.error("Destination creation error:", error);
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
        <h1 className="text-3xl font-bold font-headline text-foreground">Create New Destination</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Core Details</CardTitle>
              <CardDescription>Basic information for the destination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sigiriya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Company ID" {...field} />
                      </FormControl>
                       <FormDescription>Enter the ID of the company this destination belongs to.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Matale District, Sri Lanka" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>The first thing users see on the destination page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="heroHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Discover the Ancient Marvel of Sigiriya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Sub-heading</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Explore Sri Lanka's iconic rock fortress and its majestic surroundings." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroBgImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://placehold.co/1920x1080.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Introduction Section</CardTitle>
              <CardDescription>Introduce the destination to your visitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="introHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intro Heading</FormLabel>
                    <FormControl><Input placeholder="Heart of Sri Lanka's Cultural Triangle" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="introDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intro Description</FormLabel>
                    <FormControl><Textarea placeholder="A detailed introduction to the destination..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="introImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intro Image URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://placehold.co/600x400.png" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>Add multiple images to showcase the destination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {galleryFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  <FormField
                    control={form.control}
                    name={`galleryImageUrls.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel>Image URL {index + 1}</FormLabel>
                        <FormControl><Input type="url" placeholder="https://placehold.co/800x600.png" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeGallery(index)}
                      disabled={galleryFields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendGallery({ url: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Image
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Things to Do</CardTitle>
              <CardDescription>List activities and points of interest for visitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {thingsToDoFields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                  <h4 className="font-semibold text-lg">Item {index + 1}</h4>
                   <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeThingToDo(index)}
                      className="absolute top-4 right-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  <FormField
                    control={form.control}
                    name={`thingsToDo.${index}.title`}
                    render={({ field }) => (
                      <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Activity Title" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`thingsToDo.${index}.description`}
                    render={({ field }) => (
                      <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Activity Description" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`thingsToDo.${index}.imageUrl`}
                    render={({ field }) => (
                      <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input type="url" placeholder="https://placehold.co/300x200.png" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`thingsToDo.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ICONS.map(({value, icon: Icon}) => (
                                <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{value}</span>
                                    </div>
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
               <Button type="button" variant="outline" onClick={() => appendThingToDo({ title: "", description: "", imageUrl: "", icon: "Star" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Thing to Do
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader><CardTitle>Attractions & Tips</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="nearbyAttractions"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nearby Attractions</FormLabel>
                        <FormControl>
                            <Input placeholder="Sigiriya Rock, Dambulla Cave Temple, Pidurangala Rock" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated list of nearby places.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Separator />

                <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Travel Tip</h4>
                    <FormField
                        control={form.control}
                        name="travelTipHeading"
                        render={({ field }) => (
                        <FormItem><FormLabel>Tip Heading</FormLabel><FormControl><Input placeholder="Best Time to Visit" {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="travelTipIcon"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tip Icon</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select an icon" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ICONS.map(({value, icon: Icon}) => (
                                        <SelectItem key={value} value={value}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <span>{value}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="travelTipDescription"
                        render={({ field }) => (
                        <FormItem><FormLabel>Tip Description</FormLabel><FormControl><Textarea placeholder="Details about the travel tip..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                    />
                </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Destination
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
