
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Make image optional for edit form
const blogFormSchemaForCreate = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  category: z.string().min(3, "Category is required."),
  image: z
    .any()
    .refine((files) => files?.length >= 1, "Featured image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

const blogFormSchemaForEdit = blogFormSchemaForCreate.extend({
  image: z
    .any()
    .optional() // Make image optional for editing
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
        (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});


export type BlogFormData = z.infer<typeof blogFormSchemaForCreate>;

interface BlogFormProps {
  initialData?: any;
  onSubmitForm: (data: BlogFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const categories = ["Culture", "Wildlife", "Adventure", "Food", "Travel"];

export function BlogForm({ initialData, onSubmitForm, isSubmitting }: BlogFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<BlogFormData>({
    resolver: zodResolver(isEditMode ? blogFormSchemaForEdit : blogFormSchemaForCreate),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      image: undefined,
    },
  });

  const watchTitle = form.watch("title");
  React.useEffect(() => {
    // Only auto-generate slug if it's a new post and slug field is not manually changed
    if (watchTitle && !isEditMode && !form.formState.dirtyFields.slug) {
      const newSlug = watchTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
      form.setValue("slug", newSlug, { shouldValidate: true });
    }
  }, [watchTitle, form, isEditMode, form.formState.dirtyFields.slug]);

  const imageRef = form.register("image");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Blog Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Top 10 Beaches in Sri Lanka" {...field} />
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
                    <Input placeholder="e.g., top-10-beaches-sri-lanka" {...field} />
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
              <FormLabel>Description / Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write the full content of your blog post here..." {...field} rows={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Featured Image</FormLabel>
                <FormControl>
                    <Input type="file" {...imageRef} />
                </FormControl>
                <FormDescription>
                    {isEditMode 
                        ? "Upload a new image to replace the current one (optional)."
                        : "Upload a featured image for the blog post (max 5MB)."
                    }
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
