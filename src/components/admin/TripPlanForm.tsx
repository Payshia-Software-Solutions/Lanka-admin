
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const tripPlanSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  durationDays: z.coerce.number().int().positive("Duration must be a positive number of days."),
  destinations: z.string().min(3, "Please list at least one destination.").transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

export type TripPlanFormData = z.infer<typeof tripPlanSchema>;

interface TripPlanFormProps {
  initialData?: TripPlanFormData;
  onSubmitForm: (data: TripPlanFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function TripPlanForm({ initialData, onSubmitForm, isSubmitting }: TripPlanFormProps) {
  const router = useRouter();

  const form = useForm<TripPlanFormData>({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      durationDays: 7,
      destinations: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip Plan Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Ultimate Sri Lanka Adventure" {...field} />
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
                <Textarea placeholder="A brief overview of the trip plan..." {...field} rows={4} />
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
              <FormLabel>Duration (in Days)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destinations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinations</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Kandy, Ella, Mirissa" {...field} />
              </FormControl>
              <FormDescription>Comma-separated list of destinations.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Trip Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

