"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User, UserRole } from "@/lib/types";
import { PlusCircle, MoreHorizontal, Edit, Trash2, KeyRound } from "lucide-react";

// Dummy data for now
const sampleUsers: User[] = [
  { id: "usr1", name: "Super Admin User", email: "super@example.com", role: "superadmin", phone: "123-456-7890" },
  { id: "usr2", name: "Website Admin Alpha", email: "admin.alpha@example.com", role: "admin", phone: "234-567-8901" },
  { id: "usr3", name: "Editor Beta", email: "editor.beta@example.com", role: "editor", phone: "345-678-9012" },
  { id: "usr4", name: "Sales Agent Gamma", email: "sales.gamma@example.com", role: "agent", phone: "456-789-0123" },
];

const roleDisplayNames: Record<UserRole, string> = {
  superadmin: "Super Admin",
  admin: "Website Admin",
  editor: "Editor",
  agent: "Sales Agent",
};

export default function UsersPage() {
  // TODO: Implement state and handlers for CRUD operations and role changes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">User Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New User
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Users</CardTitle>
          <CardDescription>Manage user accounts and their roles within the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          {sampleUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Select defaultValue={user.role} onValueChange={(value) => console.log(`Change role for ${user.id} to ${value}`)}>
                        <SelectTrigger className="w-[180px] h-9 text-xs">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleDisplayNames).map(([roleKey, roleName]) => (
                            <SelectItem key={roleKey} value={roleKey} className="text-xs">{roleName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
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
              <p className="text-lg">No users found.</p>
              <p>Click "Add New User" to create admin accounts.</p>
            </div>
          )}
        </CardContent>
      </Card>
       {/* TODO: Add UserForm in a Dialog or separate page */}
    </div>
  );
}
