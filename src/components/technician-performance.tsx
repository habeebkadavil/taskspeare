
'use client'

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { getTechnicianPerformance } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { companyDetails } from '@/lib/company';

type PerformanceData = {
    technicianId: string;
    name: string;
    totalRevenue: number;
    totalPayout: number;
    summary: string;
};

const chartConfig = {
  totalRevenue: {
    label: 'Total Revenue',
    color: 'hsl(var(--chart-1))',
  },
  totalPayout: {
    label: 'Total Payout',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function TechnicianPerformance() {
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const result = await getTechnicianPerformance();
            if (result.success) {
                setPerformanceData(result.data);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                });
            }
            setLoading(false);
        }
        fetchData();
    }, [toast]);
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>AI Technician Performance</CardTitle>
                    <CardDescription>Analyzing technician efficiency and profitability...</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Technician Performance Analysis</CardTitle>
        <CardDescription>Comparing revenue generated vs. payout expense for each technician.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={performanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                <XAxis type="number" dataKey="totalRevenue" />
                <ChartTooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    content={<ChartTooltipContent
                        formatter={(value, name) => `${companyDetails.currencySymbol}${Number(value).toFixed(2)}`}
                        indicator="dot"
                    />}
                />
                <Legend />
                <Bar dataKey="totalRevenue" fill="var(--color-totalRevenue)" radius={4} />
                <Bar dataKey="totalPayout" fill="var(--color-totalPayout)" radius={4} />
            </BarChart>
        </ChartContainer>
         <div className="space-y-2">
            {performanceData.map(tech => (
                <div key={tech.technicianId} className="flex items-start justify-between rounded-lg border p-3">
                    <div>
                        <p className="font-semibold">{tech.name}</p>
                        <p className="text-sm text-muted-foreground">{tech.summary}</p>
                    </div>
                    <div className="text-right ml-4">
                        <p className="text-sm font-bold text-[hsl(var(--chart-1))]">{companyDetails.currencySymbol}{tech.totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">vs {companyDetails.currencySymbol}{tech.totalPayout.toFixed(2)} Payout</p>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
