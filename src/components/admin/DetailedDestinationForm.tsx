
"use client";

import { useState, useEffect } from "react";
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
  PlusCircle,
  Trash2,
  Sun,
  Wind,
  Mountain,
  Utensils,
  Camera,
  Star,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

const thingToDoSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  imageUrl: z.string().url("Please enter a valid URL."),
  icon: z.string().min(1, "Please select an icon."),
});

const destinationSchema = z.object({
  heroHeading: z.string().min(3, "Hero heading is required."),
  heroSubheading: z.string().min(3, "Hero sub-heading is required."),
  heroBgImageUrl: z.string().url("Please enter a valid background image URL."),
  
  introHeading: z.string().min(3, "Intro heading is required."),
  introDescription: z.string().min(10, "Intro description must be at least 10 characters."),
  introImageUrl: z.string().url("Please enter a valid intro image URL."),

  galleryImageUrls: z.array(z.object({ url: z.string().url("Please enter a valid URL.") })),

  thingsToDo: z.array(thingToDoSchema),

  nearbyAttractions: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  
  travelTipHeading: z.string().min(3, "Travel tip heading is required."),
  travelTipIcon: z.string().min(1, "Please select an icon."),
  travelTipDescription: z.string().min(10, "Travel tip description is required."),
  
  // Core fields
  name: z.string().min(3, "Name must be at least 3 characters long."),
  websiteId: z.string().min(1, "Website ID is required."),
  location: z.string().min(3, "Location is required."),
  is_popular: z.boolean().default(false),
});

export type DestinationFormData = z.infer<typeof destinationSchema>;

const ICONS = [
  { value: "Sun", icon: Sun },
  { value: "Wind", icon: Wind },
  { value: "Mountain", icon: Mountain },
  { value: "Utensils", icon: Utensils },
  { value: "Camera", icon: Camera },
  { value: "Star", icon: Star },
];

interface DetailedDestinationFormProps {
    initialData?: Destination | null;
    onSubmitForm: (data: DestinationFormData) => Promise<void>;
    isSubmitting?: boolean;
    isEditing?: boolean;
}

export function DetailedDestinationForm({ initialData, onSubmitForm, isSubmitting = false, isEditing = false }: DetailedDestinationFormProps) {
  const router = useRouter();

  const form = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      name: initialData?.name || "",
      websiteId: initialData?.company_id?.toString() || "",
      location: initialData?.location || "",
      heroHeading: initialData?.hero_heading || "",
      heroSubheading: initialData?.hero_subheading || "",
      heroBgImageUrl: initialData?.hero_bg_image_url || "",
      introHeading: initialData?.intro_heading || "",
      introDescription: initialData?.description || "",
      introImageUrl: initialData?.intro_image_url || "",
      galleryImageUrls: initialData?.gallery_image_urls?.map(url => ({ url })) || [{ url: "" }],
      thingsToDo: initialData?.things_to_do || [],
      nearbyAttractions: (initialData?.nearby_attractions || []).join(', '),
      travelTipHeading: initialData?.travel_tip_heading || "",
      travelTipIcon: initialData?.travel_tip_icon || "Star",
      travelTipDescription: initialData?.travel_tip_description || "",
      is_popular: initialData?.is_popular || false,
    },
  });

   useEffect(() => {
    if (isEditing && !initialData?.company_id) {
       // If editing, try to get company_id from local storage as a fallback
       const storedUser = localStorage.getItem('loggedInUser');
       if (storedUser) {
           const parsedUser = JSON.parse(storedUser);
           if (parsedUser.company_id) {
               form.setValue('websiteId', parsedUser.company_id.toString());
           }
       }
    } else if (!isEditing) {
        // If creating new, get from local storage
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
           const parsedUser = JSON.parse(storedUser);
           if (parsedUser.company_id) {
               form.setValue('websiteId', parsedUser.company_id.toString());
           }
       }
    }
  }, [form, isEditing, initialData?.company_id]);

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "galleryImageUrls",
  });
  
  const { fields: thingsToDoFields, append: appendThingToDo, remove: removeThingToDo } = useFieldArray({
    control: form.control,
    name: "thingsToDo",
  });

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
          
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
                      <FormLabel>Website ID (Company ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Company ID" {...field} readOnly />
                      </FormControl>
                       <FormDescription>This is automatically set from your company profile.</FormDescription>
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
                 <FormField
                  control={form.control}
                  name="is_popular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Popular Destination</FormLabel>
                        <FormDescription>Mark this destination as popular to feature it.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
              {isEditing ? "Save Changes" : "Create Destination"}
            </Button>
          </div>

        </form>
      </Form>
  );
}
