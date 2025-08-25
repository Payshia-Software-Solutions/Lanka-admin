
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogForm, type BlogFormData } from "@/components/admin/BlogForm";

interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    image_url: string;
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch(`http://localhost/travel_web_server/blogs/${blogId}`);
        if (response.ok) {
          const data = await response.json();
          setBlog(data);
        } else {
          setBlog(null);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch blog post data.",
          });
        }
      } catch (error) {
        console.error("Error fetching blog post data:", error);
        setBlog(null);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching blog post data.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBlog();
  }, [blogId, toast]);

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('_method', 'PUT'); // Method override for PHP
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('description', data.description);
    formData.append('category', data.category);

    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }
    
    // The controller doesn't seem to require company_id on update, but it's good practice
    // to ensure it's there if the logic changes. We can get it from localStorage.
     const companyId = JSON.parse(localStorage.getItem('loggedInUser') || '{}').company_id;
     if (companyId) {
        formData.append('company_id', companyId);
     }

    try {
      const response = await fetch(`http://localhost/travel_web_server/blogs/${blogId}`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Blog Post Updated!",
          description: `Successfully updated "${responseData.blog?.title}".`,
        });
        router.push("/admin/blogs");
        router.refresh(); // To see the changes in the list
      } else {
        throw new Error(responseData.error || 'Failed to update blog post.');
      }
    } catch (error) {
      console.error("Blog update error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading blog post...</p>
      </div>
    );
  }
  
  if (!blog) {
      return (
          <div className="space-y-6 text-center">
              <h1 className="text-2xl font-bold text-destructive">Blog Post Not Found</h1>
              <p className="text-muted-foreground">The blog post with ID "{blogId}" could not be found.</p>
              <Button onClick={() => router.push("/admin/blogs")}>Back to Blogs</Button>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Edit Blog Post</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Details for: {blog?.title}</CardTitle>
          <CardDescription>Update the content for this blog post.</CardDescription>
        </CardHeader>
        <CardContent>
          <BlogForm 
            initialData={blog} 
            onSubmitForm={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
