'use server';

/**
 * @fileOverview An AI tool to categorize customers based on their history.
 *
 * - categorizeCustomers - A function that handles the customer categorization process.
 * - CategorizeCustomersInput - The input type for the categorizeCustomers function.
 * - CategorizeCustomersOutput - The return type for the categorizeCustomers function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CustomerTransactionSchema = z.object({
    id: z.string().describe('The unique ID of the sale transaction.'),
    total: z.number().describe('The total amount of the sale.'),
    date: z.string().describe('The date of the sale (ISO format).'),
    paymentStatus: z.enum(['Paid', 'Unpaid']).describe('The payment status of the sale.'),
});

const CategorizeCustomersInputSchema = z.object({
  customers: z.array(
    z.object({
      id: z.string().describe('The unique ID of the customer.'),
      name: z.string().describe('The name of the customer.'),
      serviceHistory: z.array(z.string()).describe('A list of services the customer has received.'),
      transactions: z.array(CustomerTransactionSchema).describe('A list of the customer\'s past transactions.'),
    })
  ).describe('A list of customers to categorize.'),
});

export type CategorizeCustomersInput = z.infer<typeof CategorizeCustomersInputSchema>;

const CategorizeCustomersOutputSchema = z.array(
  z.object({
    customerId: z.string().describe('The unique ID of the customer.'),
    category: z.string().describe('The assigned category for the customer (e.g., VIP, Loyal, New, At-Risk).'),
    reason: z.string().describe('The reason for assigning this category.'),
  })
).describe('A list of customers with their assigned categories and reasons.');

export type CategorizeCustomersOutput = z.infer<typeof CategorizeCustomersOutputSchema>;

export async function categorizeCustomers(input: CategorizeCustomersInput): Promise<CategorizeCustomersOutput> {
  return categorizeCustomersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeCustomersPrompt',
  input: { schema: CategorizeCustomersInputSchema },
  output: { schema: CategorizeCustomersOutputSchema },
  prompt: `You are an expert marketing analyst for a salon. Your task is to categorize customers into segments based on their transaction history and service preferences.

Categorize each customer into one of the following segments:
- VIP: High-spending, frequent customers.
- Loyal: Consistent, regular customers with multiple visits.
- New: Customers with only one or two recent transactions.
- At-Risk: Previously regular customers who have not visited recently.
- Occasional: Customers who visit infrequently.

For each customer, analyze their total spending, the number of transactions, and the dates of their transactions. Provide a brief reason for your categorization.

Customers:
{{#each customers}}
- Customer ID: {{id}}
  Name: {{name}}
  Transactions:
  {{#each transactions}}
  - Sale #{{id}}: \${{total}} on {{date}} ({{paymentStatus}})
  {{/each}}
  Total Spent: \${{sum (map transactions 'total')}}
  Total Visits: {{transactions.length}}

{{/each}}

Return a JSON array of customers with their assigned categories and reasons.`,
});

const categorizeCustomersFlow = ai.defineFlow(
  {
    name: 'categorizeCustomersFlow',
    inputSchema: CategorizeCustomersInputSchema,
    outputSchema: CategorizeCustomersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
