// anomaly-alerts.ts
'use server';

/**
 * @fileOverview Anomaly detection AI agent.
 *
 * - generateAnomalyAlert - A function that generates anomaly alerts based on KPI data.
 * - AnomalyAlertInput - The input type for the generateAnomalyAlert function.
 * - AnomalyAlertOutput - The return type for the generateAnomalyAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnomalyAlertInputSchema = z.object({
  kpiData: z
    .string()
    .describe(
      'Key Performance Indicator data in JSON format.  Must be a string representation of a JSON object.'
    ),
  description: z
    .string()
    .describe('The description of the KPI data to look for anomalies.'),
});

export type AnomalyAlertInput = z.infer<typeof AnomalyAlertInputSchema>;

const AnomalyAlertOutputSchema = z.object({
  hasAnomaly: z.boolean().describe('Whether or not an anomaly was detected.'),
  alertMessage: z
    .string()
    .describe('A message describing the anomaly, if any.'),
});

export type AnomalyAlertOutput = z.infer<typeof AnomalyAlertOutputSchema>;

export async function generateAnomalyAlert(
  input: AnomalyAlertInput
): Promise<AnomalyAlertOutput> {
  return generateAnomalyAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'anomalyAlertPrompt',
  input: {schema: AnomalyAlertInputSchema},
  output: {schema: AnomalyAlertOutputSchema},
  prompt: `You are an expert data analyst specializing in anomaly detection.

You will use the provided KPI data and its description to identify any unusual patterns or anomalies.

Description: {{{description}}}
Data: {{{kpiData}}}

Based on this information, determine if there is an anomaly and generate an alert message if necessary.
If no anomaly is found, the hasAnomaly boolean should be set to false and the alert message should indicate that no anomalies were detected.

Ensure that the output is valid JSON.`,
});

const generateAnomalyAlertFlow = ai.defineFlow(
  {
    name: 'generateAnomalyAlertFlow',
    inputSchema: AnomalyAlertInputSchema,
    outputSchema: AnomalyAlertOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse the kpiData to ensure it's valid JSON
      JSON.parse(input.kpiData);
    } catch (error) {
      // If parsing fails, return an error indicating invalid JSON
      return {
        hasAnomaly: true,
        alertMessage: `Invalid KPI data format.  The provided kpiData must be a string representation of a JSON object.  Parsing Error: ${error}`,
      };
    }

    const {output} = await prompt(input);
    return output!;
  }
);
