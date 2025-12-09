'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LedgerAccount, Sale, Item, JobOrder, Technician, Customer } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportData {
  name: string;
  value: number;
  amount?: number;
}

export function ReportsClient({
  initialReportId,
  ledgerAccounts,
  sales,
  expenses,
  items,
  jobOrders,
  technicians,
  customers,
  services,
}: {
  initialReportId?: string;
  ledgerAccounts: LedgerAccount[];
  sales: Sale[];
  expenses: any[];
  items: Item[];
  jobOrders: JobOrder[];
  technicians: Technician[];
  customers: Customer[];
  services: Item[];
}) {
  const [reportType, setReportType] = useState(initialReportId || 'trial-balance');

  const generateTrialBalance = () => {
    return ledgerAccounts.map(account => ({
      name: account.name,
      type: account.type,
      debit: ['Asset', 'Expense'].includes(account.type) ? account.openingBalance : 0,
      credit: ['Liability', 'Equity', 'Revenue'].includes(account.type) ? account.openingBalance : 0,
    }));
  };

  const generatePnL = () => {
    const revenue = sales.reduce((sum, sale) => {
      const saleAmount = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return sum + saleAmount;
    }, 0);

    const expenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return [
      { category: 'Revenue', amount: revenue },
      { category: 'Expenses', amount: -expenseAmount },
      { category: 'Net Income', amount: revenue - expenseAmount },
    ];
  };

  const generateBalanceSheet = () => {
    const assets = ledgerAccounts
      .filter(acc => acc.type === 'Asset')
      .reduce((sum, acc) => sum + acc.openingBalance, 0);

    const liabilities = ledgerAccounts
      .filter(acc => acc.type === 'Liability')
      .reduce((sum, acc) => sum + acc.openingBalance, 0);

    const equity = ledgerAccounts
      .filter(acc => acc.type === 'Equity')
      .reduce((sum, acc) => sum + acc.openingBalance, 0);

    return {
      assets,
      liabilities,
      equity,
      totalLiabilitiesEquity: liabilities + equity,
    };
  };

  const trialBalance = generateTrialBalance();
  const pnlData = generatePnL();
  const balanceSheet = generateBalanceSheet();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Report" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trial-balance">Trial Balance</SelectItem>
            <SelectItem value="pnl">Profit & Loss</SelectItem>
            <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reportType === 'trial-balance' && (
        <Card>
          <CardHeader>
            <CardTitle>Trial Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell className="text-right">₹{row.debit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{row.credit.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'pnl' && (
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-2xl font-bold">₹{pnlData[0].amount.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-2xl font-bold">₹{Math.abs(pnlData[1].amount).toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Net Income</div>
                  <div className="text-2xl font-bold">₹{pnlData[2].amount.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'balance-sheet' && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Assets</h3>
                <Card className="bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-600">Total Assets</div>
                    <div className="text-2xl font-bold">₹{balanceSheet.assets.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Liabilities & Equity</h3>
                <div className="space-y-4">
                  <Card className="bg-red-50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600">Total Liabilities</div>
                      <div className="text-xl font-bold">₹{balanceSheet.liabilities.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600">Total Equity</div>
                      <div className="text-xl font-bold">₹{balanceSheet.equity.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600">Total Liabilities & Equity</div>
                      <div className="text-xl font-bold">₹{balanceSheet.totalLiabilitiesEquity.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {balanceSheet.assets === balanceSheet.totalLiabilitiesEquity ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✓ Balance Sheet is balanced
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                ⚠ Balance Sheet is not balanced. Difference: ₹{Math.abs(balanceSheet.assets - balanceSheet.totalLiabilitiesEquity).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}