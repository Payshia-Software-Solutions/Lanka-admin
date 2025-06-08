import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Package Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Package
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Packages</CardTitle>
          <CardDescription>Manage tour packages available on your websites.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">No packages found.</p>
            <p>Packages list will be displayed here. Each package can have its itinerary managed via a link like <Link href="/admin/packages/sample-id/itinerary" className="text-primary hover:underline">Manage Itinerary</Link>.</p>
            {/* Placeholder for table or card list of packages */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
