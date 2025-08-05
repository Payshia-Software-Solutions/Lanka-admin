"use client";

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
import { PlusCircle, MoreHorizontal, Edit, Trash2, Globe } from "lucide-react";
import type { Destination } from "@/lib/types";

// Dummy data for destinations
const sampleDestinations: Destination[] = [
  {
    id: "dest1",
    name: "Kandy",
    description:
      "A large city in central Sri Lanka. It's set on a plateau surrounded by mountains, which are home to tea plantations and biodiverse rainforest.",
    location: "Kandy, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "1",
  },
  {
    id: "dest2",
    name: "Ella",
    description:
      "A small town in the Badulla District of Uva Province, Sri Lanka. It is approximately 200 kilometres east of Colombo and is situated at an elevation of 1,041 metres above sea level.",
    location: "Ella, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "2",
  },
  {
    id: "dest3",
    name: "Mirissa",
    description:
      "A small town on the south coast of Sri Lanka, located in the Matara District of the Southern Province. It is a popular tourist destination for its beaches and whale watching.",
    location: "Mirissa, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "1",
  },
  {
    id: "dest4",
    name: "Sigiriya",
    description:
      "An ancient rock fortress located in the northern Matale District near the town of Dambulla in the Central Province, Sri Lanka. The name refers to a site of historical and archaeological significance that is dominated by a massive column of rock nearly 200 metres high.",
    location: "Sigiriya, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "3",
  },
];

export default function DestinationsPage() {
  // TODO: Implement state and handlers for CRUD operations

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">
          Destination Management
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Destination
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            All Destinations
          </CardTitle>
          <CardDescription>
            Manage tourism destinations for your websites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sampleDestinations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Website ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleDestinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">
                      {destination.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate">
                      {destination.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {destination.websiteId}
                      </div>
                    </TableCell>
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
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
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
              <p className="text-lg">No destinations found.</p>
              <p>Click "Add New Destination" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* TODO: Add DestinationForm in a Dialog or separate page */}
    </div>
  );
}
