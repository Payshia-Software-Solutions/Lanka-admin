
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, DollarSign, CalendarDays } from "lucide-react";
import type { Package, PackageStatus } from "@/lib/types";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

// Exporting sample data so it can be used by edit page temporarily
export const samplePackagesData: Package[] = [
  {
    id: "pkg1",
    slug: "kandy-cultural-escape",
    title: "Kandy Cultural Escape",
    description: "Explore the rich heritage of Kandy, the last royal capital of Sri Lanka. Visit the Temple of the Tooth Relic and enjoy a cultural show.",
    price: 350,
    durationDays: 3,
    websiteId: "1",
    category: "Cultural",
    coverImageUrl: "https://placehold.co/600x400.png",
    images: ["https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
    status: "Published",
    inclusions: ["Accommodation", "Breakfast", "Guided Tours"],
    exclusions: ["Lunch", "Dinner", "Entrance Fees"],
    availabilityStart: new Date(2024, 0, 1),
    availabilityEnd: new Date(2024, 11, 31),
    createdAt: new Date(2023, 10, 1),
    updatedAt: new Date(2023, 11, 1),
    destinations: [{id: "dest1", name: "Kandy", description: "...", location:"...", images: [], websiteId: "1"}],
  },
  {
    id: "pkg2",
    slug: "ella-adventure-trek",
    title: "Ella Adventure Trek",
    description: "Experience the breathtaking landscapes of Ella with hikes to Little Adam's Peak and Ella Rock. Enjoy stunning views and lush tea plantations.",
    price: 480,
    durationDays: 4,
    websiteId: "2",
    category: "Adventure",
    coverImageUrl: "https://placehold.co/600x400.png",
    status: "Draft",
    inclusions: ["Accommodation", "All Meals", "Trekking Guide", "Transport"],
    exclusions: ["Personal Expenses"],
    createdAt: new Date(2023, 9, 15),
    updatedAt: new Date(2023, 10, 15),
    destinations: [{id: "dest2", name: "Ella", description: "...", location:"...", images: [], websiteId: "2"}],
  },
  {
    id: "pkg3",
    slug: "south-coast-beach-bliss",
    title: "South Coast Beach Bliss",
    description: "Relax and unwind on the beautiful beaches of Sri Lanka's south coast. Enjoy sun, sand, and surf in Mirissa and Unawatuna.",
    price: 600,
    durationDays: 5,
    websiteId: "1",
    category: "Beach",
    coverImageUrl: "https://placehold.co/600x400.png",
    status: "Published",
    inclusions: ["Beachfront Accommodation", "Breakfast", "Surfing Lessons"],
    exclusions: ["Flights", "Visa"],
    availabilityStart: new Date(2024, 2, 1),
    createdAt: new Date(2023, 11, 10),
    updatedAt: new Date(2023, 11, 20),
    destinations: [{id: "dest3", name: "Mirissa", description: "...", location:"...", images: [], websiteId: "1"}],
  },
];

const statusColors: Record<PackageStatus, string> = {
  Draft: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  Published: "bg-green-500/20 text-green-700 border-green-500/30",
  Archived: "bg-neutral-500/20 text-neutral-700 border-neutral-500/30",
};


export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(samplePackagesData);
  const { toast } = useToast();

  const handleDeletePackage = (packageId: string) => {
    // This is a placeholder. In a real app, you'd call an API.
    setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== packageId));
    toast({
      title: "Package Deleted",
      description: `Package with ID ${packageId} has been removed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Package Management</h1>
        <Button asChild>
          <Link href="/admin/packages/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Package
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Packages</CardTitle>
          <CardDescription>Manage tour packages available on your websites.</CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Website ID</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <Image 
                        src={pkg.coverImageUrl || "https://placehold.co/40x40.png"} 
                        alt={pkg.title} 
                        width={40} 
                        height={40} 
                        className="rounded-sm object-cover"
                        data-ai-hint="tour package" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{pkg.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                        {pkg.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
                        {pkg.durationDays} days
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-semibold ${statusColors[pkg.status]}`}>{pkg.status}</Badge>
                    </TableCell>
                    <TableCell>{pkg.websiteId}</TableCell>
                    <TableCell>{format(pkg.updatedAt, "PP")}</TableCell>
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
                            <Link href={`/admin/packages/${pkg.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Package
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/packages/${pkg.id}/itinerary`}>
                              <Eye className="mr-2 h-4 w-4" /> {/* Using Eye as placeholder for itinerary list/view */}
                              Manage Itinerary
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Package
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
              <p className="text-lg">No packages found.</p>
              <p>Click "Add New Package" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
