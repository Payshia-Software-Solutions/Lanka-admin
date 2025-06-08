import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function DestinationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Destination Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Destination
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Destinations</CardTitle>
          <CardDescription>Manage tourism destinations for your websites.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">No destinations found.</p>
            <p>Destinations list will be displayed here. Click "Add New Destination" to create one.</p>
            {/* Placeholder for table or card list of destinations */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
