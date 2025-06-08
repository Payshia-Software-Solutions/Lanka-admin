
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PackageForm, type PackageFormData } from "@/components/admin/PackageForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Package } from "@/lib/types";
import { getInitialPackages } from '@/lib/package-data';

const LOCAL_STORAGE_PACKAGES_KEY = "LANKA_ADMIN_PACKAGES";
 
export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const packageId = params.id as string;

  const [pkg, setPkg] = useState<Package | null | undefined>(undefined); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (packageId && typeof window !== 'undefined') {
      setIsLoadingData(true);
      const storedPackagesRaw = localStorage.getItem(LOCAL_STORAGE_PACKAGES_KEY);
      let packages: Package[] = [];
      if (storedPackagesRaw) {
         try {
            packages = JSON.parse(storedPackagesRaw).map((p: any) => ({
                ...p,
                availabilityStart: p.availabilityStart ? new Date(p.availabilityStart) : undefined,
                availabilityEnd: p.availabilityEnd ? new Date(p.availabilityEnd) : undefined,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
            }));
        } catch (e) {
            console.error("Failed to parse packages from localStorage for edit", e);
            packages = getInitialPackages(); // Fallback
            localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(packages));

        }
      } else {
        // Should ideally not happen if main page is visited first
        packages = getInitialPackages();
        localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(packages));
      }
      
      const foundPackage = packages.find(p => p.id === packageId);
      setPkg(foundPackage || null);
      setIsLoadingData(false);
    }
  }, [packageId]);

  const handleSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    
    if (typeof window !== 'undefined' && pkg) {
        try {
            const storedPackagesRaw = localStorage.getItem(LOCAL_STORAGE_PACKAGES_KEY);
            let packages: Package[] = [];
            if (storedPackagesRaw) {
                 packages = JSON.parse(storedPackagesRaw).map((p: any) => ({
                    ...p,
                    availabilityStart: p.availabilityStart ? new Date(p.availabilityStart) : undefined,
                    availabilityEnd: p.availabilityEnd ? new Date(p.availabilityEnd) : undefined,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                }));
            }

            const packageIndex = packages.findIndex(p => p.id === packageId);
            if (packageIndex !== -1) {
                packages[packageIndex] = {
                ...packages[packageIndex],
                ...data,
                updatedAt: new Date(),
                // Ensure array fields are correctly assigned
                images: data.images || [],
                inclusions: data.inclusions || [],
                exclusions: data.exclusions || [],
                destinations: data.destinations || [],
                };
                localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(packages));
                toast({
                title: "Package Updated",
                description: `Package "${data.title}" has been successfully updated.`,
                });
                router.push("/admin/packages");
            } else {
                toast({
                    title: "Error",
                    description: "Could not find the package to update.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating package:", error);
            toast({
                title: "Error",
                description: "Could not update package. Please try again.",
                variant: "destructive",
            });
        }
    }
    setIsSubmitting(false);
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
        <p className="text-muted-foreground">The package with ID "{packageId}" could not be found in local storage.</p>
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

