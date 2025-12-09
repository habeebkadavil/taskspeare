'use server';

/**
 * @fileOverview An AI tool to find available appointment slots.
 *
 * - findAvailableSlots - A function that suggests appointment slots.
 * - FindSlotsInput - The input type for the function.
 * - FindSlotsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { subDays, addDays, setHours, setMinutes, setSeconds, format } from 'date-fns';

const FindSlotsInputSchema = z.object({
    technicianId: z.string().describe('The ID of the technician.'),
    existingAppointments: z.array(z.object({
        startTime: z.string().describe('The start time of an existing appointment in ISO format.'),
        endTime: z.string().describe('The end time of an existing appointment in ISO format.'),
    })).describe('A list of the technician\'s existing appointments.'),
    serviceDuration: z.number().describe('The duration of the service in minutes.'),
    preferredDate: z.string().describe('The customer\'s preferred date in ISO format.'),
});

export type FindSlotsInput = z.infer<typeof FindSlotsInputSchema>;

const FindSlotsOutputSchema = z.object({
    suggestedSlots: z.array(z.string().describe('A list of suggested appointment start times in ISO format.')),
});

export type FindSlotsOutput = z.infer<typeof FindSlotsOutputSchema>;

export async function findAvailableSlots(input: FindSlotsInput): Promise<FindSlotsOutput> {
  return findAvailableSlotsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findAvailableSlotsPrompt',
  input: { schema: FindSlotsInputSchema },
  output: { schema: FindSlotsOutputSchema },
  prompt: `You are an intelligent appointment scheduler. Your task is to find available time slots for a technician based on their existing appointments, a requested service duration, and a preferred date.

Working Hours: Assume the technician works from 9:00 AM to 5:00 PM.
Buffer Time: Assume a 15-minute buffer between appointments.
Service Duration: The appointment needs to fit the service duration of {{{serviceDuration}}} minutes.

Technician ID: {{technicianId}}
Preferred Date: {{preferredDate}}

Existing Appointments on and around the preferred date:
{{#each existingAppointments}}
- From: {{startTime}} To: {{endTime}}
{{/each}}

Analyze the technician's schedule on the preferred date. If no slots are available, check the day before and the day after.

Suggest a few suitable start times for the new appointment. Return the suggested slots as an array of ISO strings.`,
});

const findAvailableSlotsFlow = ai.defineFlow(
  {
    name: 'findAvailableSlotsFlow',
    inputSchema: FindSlotsInputSchema,
    outputSchema: FindSlotsOutputSchema,
  },
  async (input) => {
    // For this prototype, we'll use a simpler logic-based approach instead of an LLM call
    // to provide deterministic and faster results for suggesting time slots.
    const { existingAppointments, serviceDuration, preferredDate } = input;
    const workDayStartHour = 9;
    const workDayEndHour = 17;
    const bufferMinutes = 15;
    
    const suggestedSlots: string[] = [];
    const datesToCheck = [
        new Date(preferredDate),
        subDays(new Date(preferredDate), 1),
        addDays(new Date(preferredDate), 1)
    ];

    for (const date of datesToCheck) {
        let currentTime = setSeconds(setMinutes(setHours(date, workDayStartHour), 0), 0);
        const endOfDay = setSeconds(setMinutes(setHours(date, workDayEndHour), 0), 0);

        while (suggestedSlots.length < 5) {
            const proposedEndTime = new Date(currentTime.getTime() + serviceDuration * 60000);
            
            if (proposedEndTime > endOfDay) {
                break; // Slot extends beyond working hours
            }

            const isSlotAvailable = !existingAppointments.some(appt => {
                const existingStart = new Date(new Date(appt.startTime).getTime() - bufferMinutes * 60000);
                const existingEnd = new Date(new Date(appt.endTime).getTime() + bufferMinutes * 60000);
                return (currentTime < existingEnd && proposedEndTime > existingStart);
            });

            if (isSlotAvailable) {
                suggestedSlots.push(currentTime.toISOString());
            }

            // Move to the next 30-minute interval
            currentTime = new Date(currentTime.getTime() + 30 * 60000);
        }
        if (suggestedSlots.length >= 5) break;
    }

    return { suggestedSlots: suggestedSlots.slice(0, 5) };

    // LLM-based implementation (commented out for prototype)
    // const { output } = await prompt(input);
    // return output!;
  }
);
