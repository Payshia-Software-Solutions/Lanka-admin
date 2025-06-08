"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Website } from "@/lib/types";
import { PlusCircle, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Dummy data for now
const sampleWebsites: Website[] = [
  { id: "1", name: "Sri Lanka Wonders", domain: "srilankawonders.com", logoUrl: "https://placehold.co/40x40.png?text=SLW", contact: "info@srilankawonders.com", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Ceylon Adventures", domain: "ceylonadventures.lk", logoUrl: "https://placehold.co/40x40.png?text=CA", contact: "support@ceylonadventures.lk", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "Lanka Tours Pro", domain: "lankatourspro.com", logoUrl: "https://placehold.co/40x40.png?text=LTP", contact: "bookings@lankatourspro.com", createdAt: new Date(), updatedAt: new Date() },
];

export default function WebsitesPage() {
  // TODO: Implement state and handlers for CRUD operations

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Website Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Website
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Websites</CardTitle>
          <CardDescription>View and manage all configured tourism websites.</CardDescription>
        </CardHeader>
        <CardContent>
          {sampleWebsites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleWebsites.map((website) => (
                  <TableRow key={website.id}>
                    <TableCell>
                      <Image src={website.logoUrl} alt={`${website.name} logo`} data-ai-hint="website logo" width={40} height={40} className="rounded-sm" />
                    </TableCell>
                    <TableCell className="font-medium">{website.name}</TableCell>
                    <TableCell>
                      <Link href={`http://${website.domain}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                        {website.domain} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell>{website.contact}</TableCell>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Site
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No websites found.</p>
              <p>Click "Add New Website" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* TODO: Add WebsiteForm in a Dialog or separate page */}
    </div>
  );
}
