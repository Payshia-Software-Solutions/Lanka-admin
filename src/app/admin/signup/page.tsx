
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // State for all form fields
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Create the company first
      const companyResponse = await fetch('http://localhost/travel_web_server/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: companyName }),
      });

      if (!companyResponse.ok) {
        // Try to get an error message from the response, but don't assume it's JSON
        const errorText = await companyResponse.text();
        let errorMessage = 'Failed to create company.';
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
            // It's not JSON, so use the text directly if it's not too long
            if (errorText.length > 0 && errorText.length < 100) {
              errorMessage = errorText;
            }
        }
        throw new Error(errorMessage);
      }
      
      // Since the response might be empty, we can't reliably get the ID from it.
      // The backend should create the user with the correct company association.
      // This is a workaround for the empty response issue.
      // Ideally, the backend should return the created company with its ID.

      // Step 2: Create the user. The backend will need to find the company created above.
      // This assumes the backend handles the association.
      const userResponse = await fetch('http://localhost/travel_web_server/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // The backend will need a way to associate this user with the company just created.
          // Sending company_name again, assuming the backend can use it.
          company_name: companyName,
          full_name: fullName,
          address: address,
          country: country,
          phone_number: phoneNumber,
          email: email,
          password: password,
          role: 'admin',
        }),
      });

      if (userResponse.ok) {
        toast({
          title: "Signup Successful!",
          description: "Your account has been created. Please log in.",
        });
        router.push('/admin/login');
      } else {
        const errorText = await userResponse.text();
        let errorMessage = 'Failed to create user.';
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
             if (errorText.length > 0 && errorText.length < 100) {
              errorMessage = errorText;
            }
        }
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Signup fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoading}
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
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-3 mt-4" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating Account..." : "Create Account"}
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
