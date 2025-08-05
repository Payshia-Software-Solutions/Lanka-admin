
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/types";

const destinationFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  location: z.string().min(3, "Location is required."),
  websiteId: z.string().min(1, "Website ID is required."),
  images: z.string().optional().transform((val) => val ? val.split(",").map(s => s.trim()).filter(Boolean) : []),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type DestinationFormData = z.infer<typeof destinationFormSchema>;

interface DestinationFormProps {
  initialData?: Destination | null;
  onSubmitForm: (data: DestinationFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function DestinationForm({ initialData, onSubmitForm, isSubmitting }: DestinationFormProps) {
  const router = useRouter();

  const defaultValues = initialData ? {
    ...initialData,
    images: initialData.images?.join(", ") || "",
  } : {
    name: "",
    description: "",
    location: "",
    websiteId: "",
    images: "",
    metaTitle: "",
    metaDescription: "",
  };

  const form = useForm<DestinationFormData>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Kandy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the destination..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Kandy, Sri Lanka" {...field} />
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
                    <Input placeholder="ID of the website this destination belongs to" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URLs</FormLabel>
              <FormControl>
                <Textarea placeholder="Comma-separated URLs: https://...1.png, https://...2.png" {...field} />
              </FormControl>
              <FormDescription>Provide comma-separated URLs for gallery images.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-lg font-medium">SEO Information</h3>
            <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                    <Input placeholder="SEO friendly title for the destination" {...field} />
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
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                    <Textarea placeholder="SEO friendly description for the destination" {...field} rows={3}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>


        <div className="flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Destination"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
