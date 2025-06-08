
"use client";

import { useState } from "react";
import { PackageForm, type PackageFormData } from "@/components/admin/PackageForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPackagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    console.log("Creating new package:", data);
    // Placeholder for API call to create package
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    toast({
      title: "Package Created",
      description: `Package "${data.title}" has been successfully created.`,
    });
    setIsSubmitting(false);
    router.push("/admin/packages"); // Redirect to packages list
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Create New Package</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Package Details</CardTitle>
          <CardDescription>Fill in the information for the new tour package.</CardDescription>
        </CardHeader>
        <CardContent>
          <PackageForm onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
