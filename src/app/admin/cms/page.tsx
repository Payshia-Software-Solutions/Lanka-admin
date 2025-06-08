"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CMSPage } from "@/lib/types";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from 'date-fns';

// Dummy data for now
const sampleCmsPages: CMSPage[] = [
  { id: "1", slug: "about-us", title: "About Us", content: "...", websiteId: "1", lastUpdatedAt: new Date(2023, 10, 15) },
  { id: "2", slug: "contact", title: "Contact Information", content: "...", websiteId: "1", lastUpdatedAt: new Date(2023, 11, 1) },
  { id: "3", slug: "privacy-policy", title: "Privacy Policy", content: "...", websiteId: "2", lastUpdatedAt: new Date() },
];

export default function CmsManagementPage() {
  // TODO: Implement state and handlers for CRUD operations

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">CMS Content Pages</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Page
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Manage Pages</CardTitle>
          <CardDescription>Edit content for pages like 'About Us', 'Contact', etc.</CardDescription>
        </CardHeader>
        <CardContent>
          {sampleCmsPages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Website ID</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleCmsPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                    <TableCell>{page.websiteId}</TableCell>
                    <TableCell>{page.lastUpdatedAt ? format(page.lastUpdatedAt, "PPp") : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                       {/* Placeholder for actions like Edit/Delete */}
                       <Button variant="ghost" size="sm">
                         <Edit className="mr-2 h-4 w-4" /> Edit
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No CMS pages found.</p>
              <p>Click "Create New Page" to add content.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* TODO: Add CmsPageForm (with a simple textarea for content for now) in a Dialog or separate page */}
    </div>
  );
}
