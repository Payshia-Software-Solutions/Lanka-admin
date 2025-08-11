
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Placeholder for signup logic
    toast({
      title: "Signup Submitted",
      description: "Your account is pending creation. You will be redirected to the login page.",
    });
    // Redirect to login page after showing toast
    setTimeout(() => {
      router.push('/admin/login');
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary mx-auto mb-4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          <CardTitle className="text-3xl font-bold font-headline">Create an Account</CardTitle>
          <CardDescription>Join Lanka Admin to manage your tourism business.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  type="text" 
                  placeholder="e.g., Lanka Tours Inc." 
                  required 
                  className="text-base"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="fullName">Your Name</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="e.g., John Doe" 
                  required 
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  type="text" 
                  placeholder="e.g., 456 New Address, City" 
                  required 
                  className="text-base"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                    id="country" 
                    type="text" 
                    placeholder="e.g., Sri Lanka" 
                    required 
                    className="text-base"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input 
                    id="phoneNumber" 
                    type="tel" 
                    placeholder="e.g., +1234567891" 
                    required 
                    className="text-base"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Create a strong password" 
                  required 
                  className="text-base"
                />
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-3 mt-4">
              Create Account
            </Button>
          </form>
           <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/admin/login" className="font-medium text-primary hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
