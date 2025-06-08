"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Inquiry, InquiryStatus, User } from "@/lib/types";
import { MoreHorizontal, Edit, Eye, UserCheck, Mail } from "lucide-react";
import { format } from 'date-fns';

// Dummy data
const sampleSalesAgents: User[] = [
  { id: "agent1", name: "John Doe", email: "john@example.com", role: "agent" },
  { id: "agent2", name: "Jane Smith", email: "jane@example.com", role: "agent" },
];

const sampleInquiries: Inquiry[] = [
  { id: "inq1", name: "Alice Wonderland", email: "alice@example.com", message: "Interested in a 7-day hill country tour.", status: "New", websiteId: "1", createdAt: new Date(2023, 11, 5) },
  { id: "inq2", name: "Bob The Builder", email: "bob@construct.com", message: "Quotation for family package to beach areas.", status: "Quoted", websiteId: "2", assignedTo: "agent1", createdAt: new Date(2023, 11, 2) },
  { id: "inq3", name: "Charlie Brown", email: "charlie@peanuts.com", message: "Looking for adventure tours in December.", status: "Approved", websiteId: "1", assignedTo: "agent2", createdAt: new Date(2023, 10, 28) },
];

const statusColors: Record<InquiryStatus, string> = {
  New: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  Quoted: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-700 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-700 border-red-500/30",
};


export default function InquiriesPage() {
  // TODO: Implement state and handlers for updating status and assignment

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Custom Package Inquiries</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Inquiries</CardTitle>
          <CardDescription>View, manage status, and assign inquiries to sales agents.</CardDescription>
        </CardHeader>
        <CardContent>
          {sampleInquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Website ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div className="font-medium">{inquiry.name}</div>
                      <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                    </TableCell>
                    <TableCell>{inquiry.websiteId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-semibold ${statusColors[inquiry.status]}`}>{inquiry.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={inquiry.assignedTo} onValueChange={(value) => console.log(`Assign ${inquiry.id} to ${value}`)}>
                        <SelectTrigger className="w-[180px] h-9 text-xs">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
                          {sampleSalesAgents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id} className="text-xs">{agent.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{inquiry.createdAt ? format(inquiry.createdAt, "PP") : 'N/A'}</TableCell>
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
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Update Status
                          </DropdownMenuItem>
                           <DropdownMenuItem>
                            <UserCheck className="mr-2 h-4 w-4" /> Assign Agent
                          </DropdownMenuItem>
                           <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" /> Contact Customer
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
              <p className="text-lg">No inquiries found.</p>
              <p>New inquiries from public websites will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
       {/* TODO: Add InquiryForm (for status/assignment) in a Dialog */}
    </div>
  );
}
