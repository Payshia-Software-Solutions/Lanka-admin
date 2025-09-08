
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
import type { ApiDestination } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imageFileSchema = z
  .any()
  .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    ".jpg, .jpeg, .png and .webp files are accepted."
  );

const thingToDoSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  image_url: z.string().optional(), // Existing URL from API
  imageFile: z.any().optional(), // For new file uploads
});

const travelTipSchema = z.object({
  heading: z.string().min(3, "Travel tip heading is required."),
  icon: z.string().min(1, "Please select an icon."),
  description: z.string().min(10, "Travel tip description is required."),
});

const galleryImageSchema = z.object({
    file: z.any().optional(),
});


const createDestinationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  websiteId: z.string().min(1, "Website ID is required."),
  location: z.string().min(3, "Location is required."),
  is_popular: z.boolean().default(false),
  map_link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),

  heroHeading: z.string().min(3, "Hero heading is required."),
  heroSubheading: z.string().min(3, "Hero sub-heading is required."),
  heroBgImage: imageFileSchema.refine((files) => files?.length >= 1, "Hero background image is required."),
  
  introHeading: z.string().min(3, "Intro heading is required."),
  description: z.string().min(10, "Intro description must be at least 10 characters."),
  introImage: imageFileSchema.refine((files) => files?.length >= 1, "Intro image is required."),
  
  image: imageFileSchema.refine((files) => files?.length >= 1, "Main destination image is required."),

  galleryImages: z.array(galleryImageSchema),

  thingsToDo: z.array(thingToDoSchema),

  nearbyAttractions: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  
  travelTips: z.array(travelTipSchema),
});

const editDestinationSchema = createDestinationSchema.extend({
    heroBgImage: imageFileSchema.optional(),
    introImage: imageFileSchema.optional(),
    image: imageFileSchema.optional(),
});

export type DestinationFormData = z.infer<typeof createDestinationSchema>;

const ICONS = [
  { value: "Sun", icon: Sun },
  { value: "Wind", icon: Wind },
  { value: "Mountain", icon: Mountain },
  { value: "Utensils", icon: Utensils },
  { value: "Camera", icon: Camera },
  { value: "Star", icon: Star },
];

interface DetailedDestinationFormProps {
    initialData?: ApiDestination | null;
    onSubmitForm: (data: FormData) => Promise<void>;
    isSubmitting?: boolean;
    isEditing?: boolean;
}

export function DetailedDestinationForm({ initialData, onSubmitForm, isSubmitting = false, isEditing = false }: DetailedDestinationFormProps) {
  const router = useRouter();

  const form = useForm<DestinationFormData>({
    resolver: zodResolver(isEditing ? editDestinationSchema : createDestinationSchema),
    defaultValues: {
      name: initialData?.name || "",
      websiteId: initialData?.company_id?.toString() || "",
      location: initialData?.location || "",
      is_popular: initialData?.is_popular || false,
      map_link: initialData?.map_link || "",

      heroHeading: initialData?.hero_heading || "",
      heroSubheading: initialData?.hero_subheading || "",
      
      introHeading: initialData?.intro_heading || "",
      description: initialData?.description || "",
      
      galleryImages: [], // Always empty initially for new uploads
      
      thingsToDo: initialData?.things_to_do || [],
      travelTips: initialData?.travel_tips || [],
      nearbyAttractions: (initialData?.nearby_attractions || []).join(', '),
    },
  });

   useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.company_id && !form.getValues('websiteId')) {
            form.setValue('websiteId', parsedUser.company_id.toString());
        }
    }
  }, [form]);

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });
  
  const { fields: thingsToDoFields, append: appendThingToDo, remove: removeThingToDo } = useFieldArray({
    control: form.control,
    name: "thingsToDo",
  });

  const { fields: travelTipsFields, append: appendTravelTip, remove: removeTravelTip } = useFieldArray({
    control: form.control,
    name: "travelTips",
  });

  const handleFormSubmit: SubmitHandler<DestinationFormData> = (data) => {
    const formData = new FormData();
    
    // Helper to append if value exists
    const appendIfExists = (key: string, value: any) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    };
    
    appendIfExists('name', data.name);
    appendIfExists('company_id', data.websiteId);
    appendIfExists('location', data.location);
    appendIfExists('is_popular', data.is_popular.toString());
    appendIfExists('map_link', data.map_link);

    appendIfExists('hero_heading', data.heroHeading);
    appendIfExists('hero_subheading', data.heroSubheading);
    if (data.heroBgImage && data.heroBgImage[0]) {
        formData.append('hero_bg_image', data.heroBgImage[0]);
    }

    appendIfExists('intro_heading', data.introHeading);
    appendIfExists('description', data.description);
    if (data.introImage && data.introImage[0]) {
        formData.append('intro_image', data.introImage[0]);
    }

    if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
    }

    if (data.galleryImages && data.galleryImages.length > 0) {
        data.galleryImages.forEach((imageField) => {
            if (imageField.file && imageField.file[0]) {
                formData.append('gallery_images[]', imageField.file[0]);
            }
        });
    }

    data.thingsToDo.forEach((item, index) => {
      formData.append(`things_to_do[${index}][title]`, item.title);
      formData.append(`things_to_do[${index}][description]`, item.description);
      if (item.imageFile && item.imageFile[0]) {
        formData.append(`things_to_do[${index}][image]`, item.imageFile[0]);
      }
    });
    
    if (Array.isArray(data.nearbyAttractions)) {
        data.nearbyAttractions.forEach((attraction) => {
            formData.append(`nearby_attractions[]`, attraction);
        });
    }

    data.travelTips.forEach((tip, index) => {
      formData.append(`travel_tips[${index}][heading]`, tip.heading);
      formData.append(`travel_tips[${index}][icon]`, tip.icon);
      formData.append(`travel_tips[${index}][description]`, tip.description);
    });
    
    if (isEditing) {
        formData.append('_method', 'PUT');
    }

    onSubmitForm(formData);
  };


  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          
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
                  name="heroBgImage"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Background Image</FormLabel>
                      <FormControl>
                          <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                      </FormControl>
                      {isEditing && <FormDescription>Leave blank to keep the current image.</FormDescription>}
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
                name="description"
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
                  name="introImage"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Intro Image</FormLabel>
                      <FormControl>
                          <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                      </FormControl>
                      {isEditing && <FormDescription>Leave blank to keep the current image.</FormDescription>}
                      <FormMessage />
                      </FormItem>
                  )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Main Image</CardTitle>
              <CardDescription>A primary image for listings and cards.</CardDescription>
            </CardHeader>
            <CardContent>
               <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Main Destination Image</FormLabel>
                      <FormControl>
                          <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                      </FormControl>
                      {isEditing && <FormDescription>Leave blank to keep the current image.</FormDescription>}
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
                <div key={field.id} className="flex items-center gap-2">
                    <FormField
                    control={form.control}
                    name={`galleryImages.${index}.file`}
                    render={({ field: fileField }) => (
                        <FormItem className="flex-grow">
                        <FormLabel className="sr-only">Gallery Image {index + 1}</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => fileField.onChange(e.target.files)} />
                        </FormControl>
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
               <Button type="button" variant="outline" onClick={() => appendGallery({ file: null })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add More Images
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
                    name={`thingsToDo.${index}.imageFile`}
                    render={({ field: fileField }) => (
                        <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => fileField.onChange(e.target.files)} />
                        </FormControl>
                        {isEditing && (
                            <FormDescription>
                                Leave blank to keep the current image for this item.
                            </FormDescription>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
              ))}
               <Button type="button" variant="outline" onClick={() => appendThingToDo({ title: "", description: "", image_url: "", imageFile: null })}>
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

                <FormField
                  control={form.control}
                  name="map_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Link</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://maps.google.com/..." {...field} />
                      </FormControl>
                      <FormDescription>Paste a Google Maps link for the destination.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-4">Travel Tips</h3>
                  {travelTipsFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 rounded-lg border p-4 relative mb-4">
                      <h4 className="font-semibold text-lg">Tip {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTravelTip(index)}
                        className="absolute top-4 right-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <FormField
                          control={form.control}
                          name={`travelTips.${index}.heading`}
                          render={({ field }) => (
                          <FormItem><FormLabel>Tip Heading</FormLabel><FormControl><Input placeholder="Best Time to Visit" {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name={`travelTips.${index}.icon`}
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
                          name={`travelTips.${index}.description`}
                          render={({ field }) => (
                          <FormItem><FormLabel>Tip Description</FormLabel><FormControl><Textarea placeholder="Details about the travel tip..." {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendTravelTip({ heading: "", icon: "Star", description: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Travel Tip
                  </Button>
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
