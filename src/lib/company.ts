export type CountryProfile = {
    code: string;
    name: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
    currencySymbol: '₹' | '$' | '€' | '£' | 'د.إ';
    taxType: 'GST' | 'VAT';
    stateLabel: 'State' | 'Province' | 'Emirate';
    postalCodeLabel: 'PIN Code' | 'ZIP Code' | 'PO Box';
};

export const countryProfiles: CountryProfile[] = [
    { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', taxType: 'GST', stateLabel: 'State', postalCodeLabel: 'PIN Code' },
    { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', taxType: 'VAT', stateLabel: 'State', postalCodeLabel: 'ZIP Code' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', taxType: 'VAT', stateLabel: 'State', postalCodeLabel: 'PO Box' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ', taxType: 'VAT', stateLabel: 'Emirate', postalCodeLabel: 'PO Box' },
];

export type CompanyDetails = {
    name: string;
    address: string;
    email: string;
    phone: string;
    state: string;
    postalCode: string;
    country: string;
    gstn: string;
    logoUrl: string;
    documentHeaderUrl: string;
    taxType: 'GST' | 'VAT';
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
    currencySymbol: '₹' | '$' | '€' | '£' | 'د.إ';
};

export const companyDetails: CompanyDetails = {
    name: "TaskSphere",
    address: "123 Business Ave, Suite 101",
    email: "contact@tasksphere.com",
    phone: "+91 98765 43210",
    state: "Productivity City",
    postalCode: "12345",
    country: 'IN',
    gstn: "22AAAAA0000A1Z5",
    logoUrl: "/icon.png",
    documentHeaderUrl: "/header.png",
    taxType: 'GST',
    currency: 'INR',
    currencySymbol: '₹',
};
