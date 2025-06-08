"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { suggestPackagePricing, type SuggestPackagePricingInput, type SuggestPackagePricingOutput } from '@/ai/flows/suggest-package-pricing';
import { Loader2, Wand2, AlertTriangle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const pricingSchema = z.object({
  packageTitle: z.string().min(5, "Package title must be at least 5 characters long."),
  destinations: z.string().min(3, "Please list at least one destination.").transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  durationDays: z.coerce.number().int().positive("Duration must be a positive number of days."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  currentMarketPrice: z.coerce.number().optional(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

export default function PricingSuggestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestPackagePricingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      packageTitle: "",
      destinations: "",
      durationDays: 7,
      description: "",
      currentMarketPrice: undefined,
    },
  });

  const onSubmit: SubmitHandler<PricingFormData> = async (data) => {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    try {
      const inputData: SuggestPackagePricingInput = {
        ...data,
        destinations: data.destinations as string[], // Already transformed by zod
      };
      const result = await suggestPackagePricing(inputData);
      setSuggestion(result);
      toast({
        title: "Pricing Suggestion Ready!",
        description: `Suggested price for ${data.packageTitle} is ${result.suggestedPrice}.`,
      });
    } catch (e) {
      console.error("Error fetching pricing suggestion:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get pricing suggestion: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch pricing suggestion. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">AI-Powered Pricing Suggestions</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              Suggest Package Price
            </CardTitle>
            <CardDescription>
              Enter tour package details to get an AI-powered optimal price suggestion.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="packageTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 7-Day Sri Lanka Cultural Highlights" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinations</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kandy, Sigiriya, Ella" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated list of destinations.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe key features, activities, and inclusions..." {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentMarketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Market Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 500 (USD)" {...field} />
                      </FormControl>
                      <FormDescription>If known, provide the current average market price for similar packages.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Suggest Price
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
          {isLoading && (
            <Card className="flex flex-col items-center justify-center h-64 shadow-md border-dashed border-primary/50">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-primary font-medium">Generating suggestion...</p>
              <p className="text-sm text-muted-foreground">This may take a moment.</p>
            </Card>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="shadow-md">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {suggestion && !isLoading && (
            <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-accent" />
                  AI Pricing Suggestion
                </CardTitle>
                <CardDescription>
                  Optimal price for "{form.getValues("packageTitle")}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-background/50 rounded-lg border border-accent/50">
                  <p className="text-sm text-muted-foreground">Suggested Price (USD)</p>
                  <p className="text-5xl font-bold text-accent my-2">${suggestion.suggestedPrice.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Reasoning:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-secondary/30 rounded-md border border-border">
                    {suggestion.reasoning}
                  </p>
                </div>
              </CardContent>
               <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => { setSuggestion(null); form.reset(); }}>
                  Start New Suggestion
                </Button>
              </CardFooter>
            </Card>
          )}
           {!isLoading && !suggestion && !error && (
            <Card className="flex flex-col items-center justify-center h-64 shadow-md border-dashed border-border">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground font-medium">Your suggestion will appear here.</p>
              <p className="text-sm text-muted-foreground">Fill out the form to get started.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
