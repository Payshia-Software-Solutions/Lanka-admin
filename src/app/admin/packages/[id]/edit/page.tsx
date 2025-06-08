
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PackageForm, type PackageFormData } from "@/components/admin/PackageForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Package } from "@/lib/types";

// Temporary: Using sample data from packages page. Replace with API call.
import { samplePackagesData } from "../page"; 


export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const packageId = params.id as string;

  const [pkg, setPkg] = useState<Package | null | undefined>(undefined); // undefined for loading, null if not found
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (packageId) {
      // Simulate fetching package data
      setIsLoadingData(true);
      setTimeout(() => { // Simulate API delay
        const foundPackage = samplePackagesData.find(p => p.id === packageId);
        setPkg(foundPackage || null);
        setIsLoadingData(false);
      }, 500);
    }
  }, [packageId]);

  const handleSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    console.log(`Updating package ${packageId}:`, data);
    // Placeholder for API call to update package
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    toast({
      title: "Package Updated",
      description: `Package "${data.title}" has been successfully updated.`,
    });
    setIsSubmitting(false);
    router.push("/admin/packages"); // Redirect to packages list
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading package data...</p>
      </div>
    );
  }

  if (pkg === null) {
    return (
      <div className="space-y-6 text-center">
         <h1 className="text-2xl font-bold text-destructive">Package Not Found</h1>
        <p className="text-muted-foreground">The package with ID "{packageId}" could not be found.</p>
        <Button onClick={() => router.push("/admin/packages")}>Back to Packages</Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Edit Package</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Package Details for: {pkg?.title}</CardTitle>
          <CardDescription>Update the information for this tour package.</CardDescription>
        </CardHeader>
        <CardContent>
          {pkg && <PackageForm initialData={pkg} onSubmitForm={handleSubmit} isSubmitting={isSubmitting} />}
        </CardContent>
      </Card>
    </div>
  );
}
