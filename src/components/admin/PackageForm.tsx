
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Package, PackageStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const packageStatusEnum = z.enum(["Draft", "Published", "Archived"]);

const packageFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  slug: z.string().min(3, "Slug must be at least 3 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  durationDays: z.coerce.number().int().positive("Duration must be a positive integer."),
  category: z.string().optional(),
  status: packageStatusEnum,
  websiteId: z.string().min(1, "Website ID is required."),
  coverImageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  images: z.string().optional().transform((val) => val ? val.split(",").map(s => s.trim()).filter(Boolean) : []),
  inclusions: z.string().optional().transform((val) => val ? val.split(",").map(s => s.trim()).filter(Boolean) : []),
  exclusions: z.string().optional().transform((val) => val ? val.split(",").map(s => s.trim()).filter(Boolean) : []),
  availabilityStart: z.date().optional(),
  availabilityEnd: z.date().optional(),
  // destinations will be handled as a simple text field for now
  destinations: z.string().optional().transform((val) => val ? val.split(",").map(s => s.trim()).filter(Boolean) : []),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
}).refine(data => {
  if (data.availabilityStart && data.availabilityEnd) {
    return data.availabilityEnd >= data.availabilityStart;
  }
  return true;
}, {
  message: "Availability end date must be after start date.",
  path: ["availabilityEnd"],
});

export type PackageFormData = z.infer<typeof packageFormSchema>;

interface PackageFormProps {
  initialData?: Package | null;
  onSubmitForm: (data: PackageFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function PackageForm({ initialData, onSubmitForm, isSubmitting }: PackageFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues = initialData ? {
    ...initialData,
    images: initialData.images?.join(", ") || "",
    inclusions: initialData.inclusions?.join(", ") || "",
    exclusions: initialData.exclusions?.join(", ") || "",
    destinations: initialData.destinations?.map(d => typeof d === 'string' ? d : d.name).join(", ") || "", // Assuming destinations can be complex objects
    availabilityStart: initialData.availabilityStart ? (typeof initialData.availabilityStart === 'string' ? parseISO(initialData.availabilityStart) : initialData.availabilityStart) : undefined,
    availabilityEnd: initialData.availabilityEnd ? (typeof initialData.availabilityEnd === 'string' ? parseISO(initialData.availabilityEnd) : initialData.availabilityEnd) : undefined,
  } : {
    title: "",
    slug: "",
    description: "",
    price: 0,
    durationDays: 1,
    category: "",
    status: "Draft" as PackageStatus,
    websiteId: "",
    coverImageUrl: "",
    images: "",
    inclusions: "",
    exclusions: "",
    destinations: "",
    metaTitle: "",
    metaDescription: "",
  };

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageFormSchema),
    defaultValues,
  });

  const watchTitle = form.watch("title");
  React.useEffect(() => {
    if (watchTitle && !initialData?.slug && !form.formState.dirtyFields.slug) {
      const newSlug = watchTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-'); // Replace multiple - with single -
      form.setValue("slug", newSlug, { shouldValidate: true });
    }
  }, [watchTitle, form, initialData?.slug]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Amazing Hill Country Adventure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., amazing-hill-country-adventure" {...field} />
                </FormControl>
                <FormDescription>URL-friendly version of the title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the tour package..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 499.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Days)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Adventure, Cultural, Beach" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(["Draft", "Published", "Archived"] as PackageStatus[]).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input placeholder="ID of the website this package belongs to" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://placehold.co/600x400.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Image URLs</FormLabel>
              <FormControl>
                <Textarea placeholder="Comma-separated URLs: https://...1.png, https://...2.png" {...field} />
              </FormControl>
              <FormDescription>Provide comma-separated URLs for gallery images.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="availabilityStart"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Availability Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availabilityEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Availability End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => form.getValues("availabilityStart") ? date < form.getValues("availabilityStart")! : date < new Date(new Date().setDate(new Date().getDate() -1)) }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="destinations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinations</FormLabel>
              <FormControl>
                <Textarea placeholder="Comma-separated destinations: Kandy, Ella, Sigiriya" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inclusions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusions</FormLabel>
              <FormControl>
                <Textarea placeholder="Comma-separated inclusions: Accommodation, Breakfast, Guided Tours" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="exclusions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exclusions</FormLabel>
              <FormControl>
                <Textarea placeholder="Comma-separated exclusions: Lunch, Dinner, Entrance Fees" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metaTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title (SEO)</FormLabel>
              <FormControl>
                <Input placeholder="SEO friendly title for the package" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description (SEO)</FormLabel>
              <FormControl>
                <Textarea placeholder="SEO friendly description for the package" {...field} rows={3}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Package"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
