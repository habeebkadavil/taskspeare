'use server'

import { prioritizeTasks } from '@/ai/flows/task-prioritization'
import { categorizeCustomers } from '@/ai/flows/customer-categorization'
import { analyzeTechnicianPerformance } from '@/ai/flows/technician-performance'
import { findAvailableSlots } from '@/ai/flows/appointment-booking'
import { technicians, jobOrders, sales, appointments } from '@/lib/data'
import type { JobOrder, Customer, Sale, TimeEntry, Appointment } from '@/lib/types'
import { differenceInHours } from 'date-fns'

export async function getPrioritizedTasks(currentTasks: JobOrder[]): Promise<any> {
  try {
    const technicianAvailability = technicians.reduce((acc, tech) => {
      acc[tech.id] = tech.availability;
      return acc;
    }, {} as Record<string, string[]>);

    const aiInput = {
      tasks: currentTasks.map(task => ({
        taskId: task.id,
        description: task.notes, // Changed from description to notes
        urgency: task.urgency,
        technicianId: task.technicianId,
        customerPreferences: '', // This was in the AI model, but not in JobOrder. Keeping it empty.
        deadline: task.deadline,
      })),
      technicianAvailability,
    };

    const prioritizedResult = await prioritizeTasks(aiInput);
    
    return { success: true, data: prioritizedResult };
  } catch (error) {
    console.error("Error prioritizing tasks:", error);
    return { success: false, error: "Failed to prioritize tasks." };
  }
}

export async function getCategorizedCustomers(customers: Customer[], sales: Sale[]): Promise<any> {
    try {
        const aiInput = {
            customers: customers.map(customer => {
                const customerSales = sales.filter(sale => sale.customerId === customer.id);
                return {
                    id: customer.id,
                    name: customer.name,
                    serviceHistory: customer.serviceHistory,
                    transactions: customerSales.map(sale => ({
                        id: sale.id,
                        total: sale.total,
                        date: sale.date,
                        paymentStatus: sale.paymentStatus,
                    })),
                };
            }),
        };

        const categorizedResult = await categorizeCustomers(aiInput);
        return { success: true, data: categorizedResult };
    } catch (error) {
        console.error("Error categorizing customers:", error);
        return { success: false, error: "Failed to categorize customers." };
    }
}

export async function getTechnicianPerformance() {
  try {
    const techPerformanceData = technicians.map(tech => {
      const techJobs = jobOrders.filter(j => j.technicianId === tech.id);
      const techSales = sales.filter(s => s.technicianId === tech.id);

      const totalHoursWorked = techJobs.reduce((acc, job) => {
        const jobHours = job.timeEntries.reduce((jobAcc, entry: TimeEntry) => {
          if (entry.endTime) {
            // Use differenceInHours for accurate hour calculation
            return jobAcc + differenceInHours(new Date(entry.endTime), new Date(entry.startTime));
          }
          return jobAcc;
        }, 0);
        return acc + jobHours;
      }, 0);

      const totalRevenue = techSales.reduce((acc, sale) => acc + sale.total, 0);

      return {
        id: tech.id,
        name: tech.name,
        payoutPerHour: tech.payoutPerHour || 0,
        totalRevenue,
        totalHoursWorked: totalHoursWorked > 0 ? totalHoursWorked : 1, // Avoid division by zero, assume at least 1 hour if they have sales
      };
    });

    const aiInput = {
        technicians: techPerformanceData
    };

    const analysisResult = await analyzeTechnicianPerformance(aiInput);
    
    return { success: true, data: analysisResult };
  } catch (error) {
    console.error("Error analyzing technician performance:", error);
    return { success: false, error: "Failed to analyze technician performance." };
  }
}

export async function getAvailableSlots(
  technicianId: string, 
  serviceDuration: number, 
  preferredDate: string
) {
  try {
    const technicianAppointments = appointments.filter(a => a.technicianId === technicianId);
    
    const aiInput = {
      technicianId,
      existingAppointments: technicianAppointments.map(a => ({ startTime: a.startTime, endTime: a.endTime })),
      serviceDuration,
      preferredDate,
    };
    
    const result = await findAvailableSlots(aiInput);
    return { success: true, data: result.suggestedSlots };
  } catch (error) {
    console.error("Error finding available slots:", error);
    return { success: false, error: "Failed to find available slots." };
  }
}
