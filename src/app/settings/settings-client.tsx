'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { CompanyDetails } from '@/lib/company';

export function SettingsClient({ initialDetails }: { initialDetails: CompanyDetails }) {
  const [details, setDetails] = useState(initialDetails);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof CompanyDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({ title: 'Success', description: 'Settings saved successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your company details and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={details.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={details.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={details.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={details.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={details.state}
                  onChange={e => handleChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={details.postalCode}
                  onChange={e => handleChange('postalCode', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={details.country}
                  onChange={e => handleChange('country', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstn">GST/Tax Number</Label>
                <Input
                  id="gstn"
                  value={details.gstn}
                  onChange={e => handleChange('gstn', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxType">Tax Type</Label>
                <Input
                  id="taxType"
                  value={details.taxType}
                  onChange={e => handleChange('taxType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={details.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input
                  id="currencySymbol"
                  value={details.currencySymbol}
                  onChange={e => handleChange('currencySymbol', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={details.logoUrl}
                  onChange={e => handleChange('logoUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerUrl">Document Header URL</Label>
                <Input
                  id="headerUrl"
                  value={details.documentHeaderUrl}
                  onChange={e => handleChange('documentHeaderUrl', e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}