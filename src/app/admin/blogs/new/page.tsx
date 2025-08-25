
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { BlogForm, type BlogFormData } from "@/components/admin/BlogForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function NewBlogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('description', data.description);
    formData.append('category', data.category);

    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    const companyId = JSON.parse(localStorage.getItem('loggedInUser') || '{}').company_id;
    if (companyId) {
        formData.append('company_id', companyId);
    } else {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not find company ID. Please log in again.",
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
      const response = await fetch('http://localhost/travel_web_server/blogs', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed, browser sets it for FormData
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Blog Post Created!",
          description: `Successfully created "${responseData.blog?.title}".`,
        });
        router.push("/admin/blogs");
      } else {
        throw new Error(responseData.error || 'Failed to create blog post.');
      }
    } catch (error) {
      console.error("Blog creation error:", error);
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
        <h1 className="text-3xl font-bold font-headline text-foreground">Create New Blog Post</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
          <CardDescription>Fill out the form to create a new blog post.</CardDescription>
        </CardHeader>
        <CardContent>
          <BlogForm onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
