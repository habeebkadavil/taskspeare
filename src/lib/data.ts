import type { Technician, Customer, Item, JobOrder, Sale, Expense, LedgerAccount, Service, User, Tax, ItemType, Brand, Unit, Category, JournalVoucher, Survey, Appointment, StoreLocation, Activity } from './types';

export const ledgerAccounts: LedgerAccount[] = [
    { id: 'ledger-1', name: 'Sales Revenue', type: 'Revenue', description: 'Income from sales of goods and services.', openingBalance: 0, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-2', name: 'Inventory Asset', type: 'Asset', description: 'Value of items held for sale.', openingBalance: 15000, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-3', name: 'Accounts Receivable', type: 'Asset', description: 'Money owed by customers.', openingBalance: 5000, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-4', name: 'Fixed Assets', type: 'Asset', description: 'Long-term assets like equipment and furniture.', openingBalance: 25000, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-5', name: 'Rent Expense', type: 'Expense', description: 'Expense for salon rental.', openingBalance: 0, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-6', name: 'Utilities Expense', type: 'Expense', description: 'Expenses for electricity, water, etc.', openingBalance: 0, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-7', name: 'Cash', type: 'Asset', description: 'Cash on hand.', openingBalance: 10000, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-8', name: 'Equity', type: 'Equity', description: 'Owner\'s equity in the business.', openingBalance: 55000, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-9', name: 'Accounts Payable', type: 'Liability', description: 'Money owed to suppliers.', openingBalance: 2500, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
    { id: 'ledger-10', name: 'Cost of Goods Sold', type: 'Expense', description: 'Cost of inventory sold.', openingBalance: 0, openingBalanceDate: '2025-01-01T12:00:00.000Z' },
];

export const taxes: Tax[] = [
    { id: 'tax-1', name: 'GST @ 18%', rate: 18 },
    { id: 'tax-2', name: 'GST @ 5%', rate: 5 },
    { id: 'tax-3', name: 'VAT @ 20%', rate: 20 },
    { id: 'tax-4', name: 'No Tax', rate: 0 },
];

export const itemTypes: ItemType[] = [
    { id: 'type-1', name: 'Stockable' },
    { id: 'type-2', name: 'Asset' },
    { id: 'type-3', name: 'Service' },
    { id: 'type-4', name: 'Expense' },
];

export const categories: Category[] = [
    { id: 'cat-1', name: 'Hair Product' },
    { id: 'cat-2', name: 'Face Product' },
    { id: 'cat-3', name: 'Nail Product' },
    { id: 'cat-4', name: 'General' },
];


export const brands: Brand[] = [
    { id: 'brand-1', name: 'L\'Oréal' },
    { id: 'brand-2', name: 'Wella' },
    { id: 'brand-3', name: 'OPI' },
    { id: 'brand-4', name: 'Generic' },
];

export const units: Unit[] = [
    { id: 'unit-1', name: 'Pieces', abbreviation: 'pcs' },
    { id: 'unit-2', name: 'Liters', abbreviation: 'L' },
    { id: 'unit-3', name: 'Grams', abbreviation: 'g' },
    { id: 'unit-4', name: 'Box', abbreviation: 'box' },
];

export const technicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Jessica Miller',
    email: 'jessica.m@salonflow.com',
    skills: ['Haircut', 'Coloring', 'Styling'],
    availability: [
      "2025-11-22T12:00:00.000Z",
      "2025-11-23T12:00:00.000Z",
    ],
    avatarUrl: 'https://picsum.photos/seed/tech1/200/200',
    payoutPerHour: 50,
  },
  {
    id: 'tech-2',
    name: 'Michael Chen',
    email: 'michael.c@salonflow.com',
    skills: ['Manicure', 'Pedicure', 'Nail Art'],
    availability: [
       "2025-11-22T12:00:00.000Z",
    ],
    avatarUrl: 'https://picsum.photos/seed/tech2/200/200',
    payoutPerHour: 45,
  },
  {
    id: 'tech-3',
    name: 'Emily Rodriguez',
    email: 'emily.r@salonflow.com',
    skills: ['Facial', 'Massage', 'Waxing'],
    availability: [
       "2025-11-24T12:00:00.000Z",
    ],
    avatarUrl: 'https://picsum.photos/seed/tech3/200/200',
    payoutPerHour: 55,
  },
];

export const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '123-456-7890',
    serviceHistory: ['Haircut', 'Manicure'],
    ledgerId: 'ledger-3',
    preferredTechnicianId: 'tech-1',
    lastServiceId: 'service-2',
  },
  {
    id: 'cust-2',
    name: 'David Lee',
    email: 'david.l@example.com',
    phone: '234-567-8901',
    serviceHistory: ['Facial'],
    ledgerId: 'ledger-3',
    preferredTechnicianId: 'tech-3',
    lastServiceId: 'service-3',
  },
  {
    id: 'cust-3',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    phone: '345-678-9012',
    serviceHistory: ['Coloring', 'Pedicure'],
    ledgerId: 'ledger-3',
    preferredTechnicianId: 'tech-2',
    lastServiceId: 'service-1',
  },
];

export const items: Item[] = [
  { id: 'item-1', name: 'Shampoo', price: 25, stock: 100, ledgerId: 'ledger-2', cost: 10, itemTypeId: 'type-1', taxId: 'tax-1', brandId: 'brand-1', unitId: 'unit-1', categoryId: 'cat-1', alternateUnits: [{ unitId: 'unit-4', conversionFactor: 12 }] },
  { id: 'item-2', name: 'Conditioner', price: 28, stock: 80, ledgerId: 'ledger-2', cost: 12, itemTypeId: 'type-1', taxId: 'tax-1', brandId: 'brand-1', unitId: 'unit-1', categoryId: 'cat-1' },
  { id: 'item-3', name: 'Nail Polish', price: 15, stock: 200, ledgerId: 'ledger-2', cost: 5, itemTypeId: 'type-1', taxId: 'tax-2', brandId: 'brand-3', unitId: 'unit-1', categoryId: 'cat-3' },
  { id: 'item-4', name: 'Styling Chair', price: 1200, stock: 5, ledgerId: 'ledger-4', cost: 1200, itemTypeId: 'type-2', taxId: 'tax-3', categoryId: 'cat-4' },
  { id: 'item-5', name: 'Rent', price: 2000, stock: 0, ledgerId: 'ledger-5', cost: 2000, itemTypeId: 'type-4', taxId: 'tax-4', categoryId: 'cat-4' },
  { id: 'item-6', name: 'Utilities', price: 300, stock: 0, ledgerId: 'ledger-6', cost: 300, itemTypeId: 'type-4', taxId: 'tax-4', categoryId: 'cat-4' },
  { id: 'service-1', name: 'Full hair coloring session', price: 150, stock: Infinity, ledgerId: 'ledger-1', itemTypeId: 'type-3', taxId: 'tax-1' },
  { id: 'service-2', name: 'Standard manicure and pedicure', price: 75, stock: Infinity, ledgerId: 'ledger-1', itemTypeId: 'type-3', taxId: 'tax-2' },
  { id: 'service-3', name: 'Deep cleansing facial', price: 90, stock: Infinity, ledgerId: 'ledger-1', itemTypeId: 'type-3', taxId: 'tax-1' },
  { id: 'service-4', name: 'Haircut and blow-dry', price: 60, stock: Infinity, ledgerId: 'ledger-1', itemTypeId: 'type-3', taxId: 'tax-2' },
];

export const services: Service[] = items
  .filter(item => item.itemTypeId === 'type-3')
  .map(item => ({ id: item.id, name: item.name, price: item.price }));


export const jobOrders: JobOrder[] = [
  {
    id: 'job-1',
    services: [{ serviceId: 'service-1', price: 150 }],
    customerId: 'cust-3',
    technicianId: 'tech-1',
    status: 'Completed',
    orderDate: "2025-11-18T12:00:00.000Z",
    deadline: "2025-11-23T12:00:00.000Z",
    timeEntries: [{ startTime: "2025-11-23T09:00:00.000Z", endTime: "2025-11-23T11:00:00.000Z" }],
    notes: 'Wants an ombre effect.',
    urgency: 'high',
    price: 150,
  },
  {
    id: 'job-2',
    services: [{ serviceId: 'service-2', price: 75 }],
    customerId: 'cust-1',
    technicianId: 'tech-2',
    status: 'In Progress',
    orderDate: "2025-11-20T12:00:00.000Z",
    deadline: "2025-11-22T12:00:00.000Z",
    timeEntries: [{ startTime: "2025-11-22T10:00:00.000Z", endTime: null }],
    notes: 'Prefers gel polish.',
    urgency: 'medium',
    price: 75,
  },
  {
    id: 'job-3',
    services: [
        { serviceId: 'service-3', price: 90 },
        { serviceId: 'service-4', price: 60 }
    ],
    customerId: 'cust-2',
    technicianId: 'tech-3',
    status: 'Completed',
    orderDate: "2025-11-21T12:00:00.000Z",
    deadline: "2025-11-26T12:00:00.000Z",
    timeEntries: [
        { startTime: "2025-11-26T13:00:00.000Z", endTime: "2025-11-26T14:30:00.000Z" },
        { startTime: "2025-11-26T14:45:00.000Z", endTime: "2025-11-26T15:30:00.000Z" }
    ],
    notes: 'Has sensitive skin.',
    urgency: 'low',
    price: 150,
  },
  {
    id: 'job-4',
    services: [{ serviceId: 'service-4', price: 60 }],
    customerId: 'cust-1',
    technicianId: 'tech-1',
    status: 'Pending',
    orderDate: "2025-11-19T12:00:00.000Z",
    deadline: "2025-11-24T12:00:00.000Z",
    timeEntries: [],
    notes: 'Just a trim.',
    urgency: 'medium',
    price: 60,
  },
];

export const sales: Sale[] = [
  {
    id: 'sale-1',
    customerId: 'cust-1',
    technicianId: 'tech-2',
    items: [
      { itemId: 'service-2', quantity: 1, price: 75, taxRate: 5 },
      { itemId: 'item-3', quantity: 2, price: 15, taxRate: 5 },
    ],
    total: 110.25, // (75 * 1.05) + (30 * 1.05)
    paymentStatus: 'Paid',
    date: "2025-11-21T12:00:00.000Z",
  },
  {
    id: 'sale-2',
    customerId: 'cust-2',
    technicianId: 'tech-3',
    items: [{ itemId: 'service-3', quantity: 1, price: 90, taxRate: 18 }],
    total: 106.2,
    paymentStatus: 'Unpaid',
    date: "2025-11-19T12:00:00.000Z",
  },
  {
    id: 'sale-3',
    customerId: 'cust-3',
    technicianId: 'tech-1',
    items: [
      { itemId: 'service-1', quantity: 1, price: 150, taxRate: 18 },
      { itemId: 'item-1', quantity: 1, price: 25, taxRate: 18 },
    ],
    total: 206.5, // (150 * 1.18) + (25 * 1.18)
    paymentStatus: 'Unpaid',
    date: "2025-11-18T12:00:00.000Z",
  },
  {
    id: 'sale-4',
    customerId: 'cust-1',
    technicianId: 'tech-1',
    items: [{ itemId: 'service-4', quantity: 1, price: 60, taxRate: 5 }],
    total: 63.00,
    paymentStatus: 'Paid',
    date: "2025-10-15T12:00:00.000Z",
  },
  {
    id: 'sale-5',
    customerId: 'cust-2',
    technicianId: 'tech-1',
    items: [
      { itemId: 'item-1', quantity: 1, price: 25, taxRate: 18 },
      { itemId: 'item-2', quantity: 1, price: 28, taxRate: 18 },
    ],
    total: 62.54, // (25 * 1.18) + (28 * 1.18)
    paymentStatus: 'Paid',
    date: "2025-10-10T12:00:00.000Z",
  },
];

export const expenses: Expense[] = [
  {
    id: 'exp-1',
    voucherNumber: 'VN-001',
    items: [{ itemId: 'item-5', quantity: 1, price: 2000, taxRate: 0 }],
    total: 2000,
    description: 'Monthly rent for salon space',
    date: "2025-11-01T12:00:00.000Z",
    payableToLedgerId: 'ledger-9',
  },
  {
    id: 'exp-2',
    voucherNumber: 'VN-002',
    items: [{ itemId: 'item-6', quantity: 1, price: 350, taxRate: 0 }],
    total: 350,
    description: 'Electricity and water bills',
    date: "2025-11-16T12:00:00.000Z",
    payableToLedgerId: 'ledger-9',
  },
];

export const journalVouchers: JournalVoucher[] = [
    {
        id: 'jv-1',
        voucherNumber: 'JV-001',
        date: '2025-11-15T12:00:00.000Z',
        narration: 'Owner\'s initial capital investment',
        total: 50000,
        entries: [
            { accountId: 'ledger-7', debit: 50000, credit: 0 },
            { accountId: 'ledger-8', debit: 0, credit: 50000 },
        ],
    },
    {
        id: 'jv-2',
        voucherNumber: 'JV-002',
        date: '2025-11-17T12:00:00.000Z',
        narration: 'Purchase of styling chairs on credit',
        total: 2400,
        entries: [
            { accountId: 'ledger-4', debit: 2400, credit: 0 },
            { accountId: 'ledger-9', debit: 0, credit: 2400 },
        ],
    },
];

export let users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@salonflow.com',
    avatarUrl: 'https://picsum.photos/seed/user1/200/200',
    permissions: ['dashboard', 'jobs', 'sales', 'expenses', 'customers', 'technicians', 'inventory', 'chart-of-accounts', 'reports', 'users', 'settings', 'calendar'],
  },
  {
    id: 'user-2',
    name: 'Receptionist',
    email: 'reception@salonflow.com',
    avatarUrl: 'https://picsum.photos/seed/user2/200/200',
    permissions: ['dashboard', 'jobs', 'sales', 'customers'],
  },
    {
    id: 'user-3',
    name: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: 'https://picsum.photos/seed/user3/200/200',
    permissions: ['dashboard', 'jobs', 'sales', 'expenses', 'customers', 'technicians', 'inventory', 'chart-of-accounts', 'reports', 'users', 'settings', 'calendar'],
  },
  {
    id: 'auth-user-demo1',
    name: 'demo1@example.com',
    email: 'demo1@example.com',
    avatarUrl: 'https://picsum.photos/seed/demo1@example.com/200/200',
    permissions: ['dashboard'],
  },
  {
    id: 'tech-user-1',
    name: 'Jessica Miller',
    email: 'jessica.m@salonflow.com',
    avatarUrl: 'https://picsum.photos/seed/tech1/200/200',
    permissions: ['dashboard', 'jobs', 'sales', 'calendar'],
    technicianId: 'tech-1'
  },
];

export const surveys: Survey[] = [
    {
        id: 'survey-1',
        jobId: 'job-1',
        customerId: 'cust-3',
        rating: 5,
        comments: 'Jessica was amazing! My hair color has never looked better.',
        date: '2025-11-23T14:00:00.000Z',
        serviceFeedback: [],
    },
    {
        id: 'survey-2',
        jobId: 'job-3',
        customerId: 'cust-2',
        rating: 4,
        comments: 'The facial was very relaxing, but the salon was a bit noisy.',
        date: '2025-11-26T16:00:00.000Z',
        serviceFeedback: [],
    }
];

export const appointments: Appointment[] = [
    {
        id: 'appt-1',
        customerId: 'cust-1',
        technicianId: 'tech-1',
        serviceId: 'service-4',
        startTime: '2025-11-25T10:00:00.000Z',
        endTime: '2025-11-25T11:00:00.000Z',
        bookingType: 'Onsite',
        status: 'Scheduled',
        notes: 'Customer wants a trim and layering.',
        storeId: 'store-1',
    },
    {
        id: 'appt-2',
        customerId: 'cust-2',
        technicianId: 'tech-3',
        serviceId: 'service-3',
        startTime: '2025-11-25T14:00:00.000Z',
        endTime: '2025-11-25T15:30:00.000Z',
        bookingType: 'Onsite',
        status: 'Completed',
        notes: 'Used hypoallergenic products as requested.',
        storeId: 'store-2',
    },
     {
        id: 'appt-3',
        customerId: 'cust-3',
        technicianId: 'tech-2',
        serviceId: 'service-2',
        startTime: '2025-11-26T11:00:00.000Z',
        endTime: '2025-11-26T12:30:00.000Z',
        bookingType: 'Customer Location',
        status: 'Scheduled',
        notes: 'Follow up for nail art.',
        address: '123 Main St, Anytown, USA 12345',
    },
];

export const stores: StoreLocation[] = [
    { id: 'store-1', name: 'Downtown Central', address: '1 Plaza, City Center' },
    { id: 'store-2', name: 'Uptown Mall', address: '100 Mall Drive, Uptown' }
];

export const activities: Activity[] = [
    {
        id: 'act-1',
        title: 'Follow up with Sarah Johnson about new products',
        type: 'Call',
        dueDate: '2025-11-30T12:00:00.000Z',
        assignedToUserId: 'user-2',
        status: 'Pending',
        notes: 'Mention the new L\'Oréal shampoo.',
        relatedTo: { type: 'job', id: 'job-2' }
    },
    {
        id: 'act-2',
        title: 'Prepare demo for Maria Garcia',
        type: 'Presentation',
        dueDate: '2025-12-02T12:00:00.000Z',
        assignedToUserId: 'tech-user-1',
        status: 'In Progress',
        notes: 'Focus on nail art techniques.',
        relatedTo: { type: 'appointment', id: 'appt-3' }
    },
    {
        id: 'act-3',
        title: 'Confirm next week\'s appointment with David Lee',
        type: 'Follow-up',
        dueDate: '2025-11-28T12:00:00.000Z',
        assignedToUserId: 'user-2',
        status: 'Completed',
    }
];
