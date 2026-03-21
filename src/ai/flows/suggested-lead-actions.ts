'use server';
/**
 * @fileOverview An AI agent that analyzes lead notes and suggests next steps or follow-up actions.
 *
 * - suggestLeadActions - A function that handles the generation of suggested lead actions.
 * - SuggestedLeadActionsInput - The input type for the suggestLeadActions function.
 * - SuggestedLeadActionsOutput - The return type for the suggestLeadActions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestedLeadActionsInputSchema = z.object({
  leadNotes: z.string().describe('Detailed notes about the lead and interactions.'),
});
export type SuggestedLeadActionsInput = z.infer<typeof SuggestedLeadActionsInputSchema>;

const SuggestedLeadActionsOutputSchema = z.object({
  actions: z.array(z.string()).describe('A list of suggested next steps or follow-up actions.'),
});
export type SuggestedLeadActionsOutput = z.infer<typeof SuggestedLeadActionsOutputSchema>;

export async function suggestLeadActions(input: SuggestedLeadActionsInput): Promise<SuggestedLeadActionsOutput> {
  return suggestedLeadActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLeadActionsPrompt',
  input: { schema: SuggestedLeadActionsInputSchema },
  output: { schema: SuggestedLeadActionsOutputSchema },
  prompt: `You are an AI assistant specialized in sales and lead management. Your task is to analyze the provided lead notes and suggest concrete, actionable next steps or follow-up actions for a sales representative.

Consider the context, past interactions, and potential blockers mentioned in the notes. Focus on generating specific, practical actions that can help move the lead forward in the sales pipeline.

Lead Notes: """{{{leadNotes}}}"""`,
});

const suggestedLeadActionsFlow = ai.defineFlow(
  {
    name: 'suggestedLeadActionsFlow',
    inputSchema: SuggestedLeadActionsInputSchema,
    outputSchema: SuggestedLeadActionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
