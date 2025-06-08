
"use client";

import { useState } from "react";
import { PackageForm, type PackageFormData } from "@/components/admin/PackageForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Package } from "@/lib/types";

const LOCAL_STORAGE_PACKAGES_KEY = "LANKA_ADMIN_PACKAGES";

export default function NewPackagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    
    try {
      if (typeof window !== 'undefined') {
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

        const newPackage: Package = {
          ...data,
          id: `pkg${Date.now()}`, // Simple unique ID
          createdAt: new Date(),
          updatedAt: new Date(),
          // Ensure array fields are correctly assigned from form data
          images: data.images || [],
          inclusions: data.inclusions || [],
          exclusions: data.exclusions || [],
          destinations: data.destinations || [],
        };
        
        packages.push(newPackage);
        localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(packages));

        toast({
          title: "Package Created",
          description: `Package "${data.title}" has been successfully created.`,
        });
        router.push("/admin/packages");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error",
        description: "Could not create the package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
