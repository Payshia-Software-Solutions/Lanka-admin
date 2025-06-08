'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal pricing for tour packages.
 *
 * - suggestPackagePricing - A function that suggests an optimal price for a tour package.
 * - SuggestPackagePricingInput - The input type for the suggestPackagePricing function.
 * - SuggestPackagePricingOutput - The return type for the suggestPackagePricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPackagePricingInputSchema = z.object({
  destinations: z.array(z.string()).describe('A list of destinations included in the package.'),
  durationDays: z.number().describe('The duration of the package in days.'),
  packageTitle: z.string().describe('The title of the tour package.'),
  description: z.string().describe('A description of the tour package, including key features and activities.'),
  currentMarketPrice: z.number().optional().describe('The current market price of similar packages, if known.'),
});
export type SuggestPackagePricingInput = z.infer<typeof SuggestPackagePricingInputSchema>;

const SuggestPackagePricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested optimal price for the tour package.'),
  reasoning: z.string().describe('The reasoning behind the suggested price, considering destinations, duration, and market prices.'),
});
export type SuggestPackagePricingOutput = z.infer<typeof SuggestPackagePricingOutputSchema>;

export async function suggestPackagePricing(input: SuggestPackagePricingInput): Promise<SuggestPackagePricingOutput> {
  return suggestPackagePricingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPackagePricingPrompt',
  input: {schema: SuggestPackagePricingInputSchema},
  output: {schema: SuggestPackagePricingOutputSchema},
  prompt: `You are an expert tourism pricing consultant. You will be given information about a tour package, including its destinations, duration, title, and description, and optionally the current market price of similar packages.

  Based on this information, you will suggest an optimal price for the tour package, and provide a reasoning for your suggestion.

  Destinations: {{destinations}}
  Duration (days): {{durationDays}}
  Package Title: {{packageTitle}}
  Description: {{description}}
  Current Market Price (if known): {{currentMarketPrice}}

  Consider the following factors when determining the price:
  * The popularity and cost of the destinations.
  * The duration of the package.
  * The features and activities included in the package.
  * The current market price of similar packages.
  * Profit margin targets.

  Provide the suggested price and your reasoning in the output.
  `,
});

const suggestPackagePricingFlow = ai.defineFlow(
  {
    name: 'suggestPackagePricingFlow',
    inputSchema: SuggestPackagePricingInputSchema,
    outputSchema: SuggestPackagePricingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
