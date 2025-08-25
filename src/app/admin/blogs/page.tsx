
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function BlogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Blog Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Post
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Blog Posts</CardTitle>
          <CardDescription>Manage your blog posts for all websites.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">No blog posts found.</p>
            <p>Click "Create New Post" to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
