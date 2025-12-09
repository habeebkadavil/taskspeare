'use server';

/**
 * @fileOverview An AI tool that intelligently prioritizes tasks based on urgency, technician availability, and customer preferences.
 *
 * - prioritizeTasks - A function that handles the task prioritization process.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      taskId: z.string().describe('The unique ID of the task.'),
      description: z.string().describe('A detailed description of the task.'),
      urgency: z.enum(['high', 'medium', 'low']).describe('The urgency level of the task.'),
      technicianId: z.string().describe('The ID of the assigned technician.'),
      customerPreferences: z.string().describe('Any specific customer preferences for the task.'),
      deadline: z.string().describe('The deadline for the task (ISO format).'),
    })
  ).describe('A list of tasks to prioritize.'),
  technicianAvailability: z.record(z.string(), z.array(z.string())).describe('A map of technician IDs to their available time slots (ISO format).'),
});

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    taskId: z.string().describe('The unique ID of the task.'),
    priorityScore: z.number().describe('A numerical score indicating the task priority (higher is better).'),
    reason: z.string().describe('The reason for the assigned priority score.'),
  })
).describe('A list of tasks with their calculated priority scores and reasons.');

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant designed to prioritize tasks for a salon, considering urgency, technician availability, and any additional notes.

Given the following tasks:

{{#each tasks}}
Task ID: {{taskId}}
Description: {{description}}
Urgency: {{urgency}}
Technician ID: {{technicianId}}
Notes: {{customerPreferences}}
Deadline: {{deadline}}

{{/each}}

and the following technician availability:

{{#each (lookup technicianAvailability)}}
Technician ID: {{@key}}
Available Slots: {{this}}
{{/each}}

Prioritize these tasks by assigning a priority score (higher is better) and providing a reason for each score. Consider task urgency, technician availability, and any relevant notes when determining the score.  Tasks close to their deadline should be prioritized higher.

Return a JSON array of tasks with their priority scores and reasons, following this schema:
${JSON.stringify(PrioritizeTasksOutputSchema.describe, null, 2)}`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
