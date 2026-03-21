
'use server';
/**
 * @fileOverview Un agente de IA que analiza las notas de los prospectos y sugiere próximos pasos o acciones de seguimiento.
 *
 * - suggestLeadActions - Una función que maneja la generación de sugerencias de acciones para prospectos.
 * - SuggestedLeadActionsInput - El tipo de entrada para la función suggestLeadActions.
 * - SuggestedLeadActionsOutput - El tipo de retorno para la función suggestLeadActions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestedLeadActionsInputSchema = z.object({
  leadNotes: z.string().describe('Notas detalladas sobre el prospecto y sus interacciones.'),
});
export type SuggestedLeadActionsInput = z.infer<typeof SuggestedLeadActionsInputSchema>;

const SuggestedLeadActionsOutputSchema = z.object({
  actions: z.array(z.string()).describe('Una lista de próximos pasos o acciones de seguimiento sugeridas.'),
});
export type SuggestedLeadActionsOutput = z.infer<typeof SuggestedLeadActionsOutputSchema>;

export async function suggestLeadActions(input: SuggestedLeadActionsInput): Promise<SuggestedLeadActionsOutput> {
  return suggestedLeadActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLeadActionsPrompt',
  input: { schema: SuggestedLeadActionsInputSchema },
  output: { schema: SuggestedLeadActionsOutputSchema },
  prompt: `Eres un asistente de IA especializado en ventas y gestión de prospectos. Tu tarea es analizar las notas proporcionadas sobre un prospecto y sugerir pasos siguientes concretos y accionables para un representante de ventas.

Considera el contexto, las interacciones pasadas y los posibles obstáculos mencionados en las notas. Enfócate en generar acciones específicas y prácticas que ayuden a avanzar al prospecto en el pipeline de ventas.

RESPONDE EXCLUSIVAMENTE EN ESPAÑOL.

Notas del Prospecto: """{{{leadNotes}}}"""`,
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
