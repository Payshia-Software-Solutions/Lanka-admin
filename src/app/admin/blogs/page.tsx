
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Blog {
    id: number;
    company_id: number;
    title: string;
    slug: string;
    description: string;
    image_url: string;
    category: string;
    created_at: string;
    updated_at: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost/travel_web_server/blogs');
      if (!response.ok) throw new Error("Failed to fetch blogs");
      
      const allBlogs = await response.json();
      if (!Array.isArray(allBlogs)) {
        console.error("Fetched data is not an array:", allBlogs);
        setBlogs([]);
        return;
      }
      
      let companyId: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
          companyId = JSON.parse(storedUser).company_id?.toString();
        }
      }

      if (companyId) {
        const filteredBlogs = allBlogs.filter(
          (blog: any) => blog.company_id && blog.company_id.toString() === companyId
        );
        setBlogs(filteredBlogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast({
        variant: "destructive",
        title: "Failed to load blogs",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDeleteBlog = async (blogId: number) => {
    const originalBlogs = [...blogs];
    setBlogs(blogs.filter((blog) => blog.id !== blogId));

    try {
        const response = await fetch(`http://localhost/travel_web_server/blogs/${blogId}`, {
            method: 'DELETE',
        });

        if (response.ok || response.status === 204) {
            toast({
                title: "Blog Post Deleted",
                description: "The blog post has been successfully removed.",
            });
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to delete. The server sent an invalid response.' }));
            setBlogs(originalBlogs); // Revert state if delete failed
            throw new Error(errorData.error || 'Failed to delete blog post.');
        }

    } catch (error) {
        setBlogs(originalBlogs); // Revert state on any error
        console.error("Error deleting blog post:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading blog posts...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Blog Management</h1>
        <Button asChild>
            <Link href="/admin/blogs/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Post
            </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Blog Posts</CardTitle>
          <CardDescription>Manage your blog posts for all websites.</CardDescription>
        </CardHeader>
        <CardContent>
           {blogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                     <TableCell>
                      {blog.image_url ? (
                         <Image 
                            src={`https://content-provider.payshia.com/travel-web/${blog.image_url}`} 
                            alt={blog.title}
                            data-ai-hint="blog post image"
                            width={80}
                            height={60}
                            className="rounded-md object-cover"
                         />
                      ) : (
                        <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{blog.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">/{blog.slug}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blogs/${blog.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the blog post "{blog.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBlog(blog.id)} className="bg-destructive hover:bg-destructive/90">
                                  Yes, delete post
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">No blog posts found.</p>
                <p>Click "Create New Post" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
