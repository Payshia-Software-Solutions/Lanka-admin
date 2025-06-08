import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-foreground">Promotion Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Promotion
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">All Promotions</CardTitle>
          <CardDescription>Manage discount codes and special offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">No promotions found.</p>
            <p>Promotions list will be displayed here. You can create global or website-specific promotions.</p>
            {/* Placeholder for table or card list of promotions */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
