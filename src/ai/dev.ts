'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/task-prioritization.ts';
import '@/ai/flows/customer-categorization.ts';
import '@/ai/flows/technician-performance.ts';
import '@/ai/flows/appointment-booking.ts';
