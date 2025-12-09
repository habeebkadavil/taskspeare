export type Technician = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  availability: string[];
  avatarUrl: string;
  payoutPerHour?: number;
};

export type Customer = {
  id:string;
  name: string;
  email: string;
  phone: string;
  serviceHistory: string[];
  ledgerId: string;
  preferredTechnicianId?: string;
  lastServiceId?: string;
};

export type Tax = {
  id: string;
  name: string;
  rate: number;
};

export type ItemType = {
  id: string;
  name: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type Unit = {
  id: string;
  name: string;
  abbreviation: string;
};

export type Category = {
  id: string;
  name: string;
};

export type AlternateUnit = {
  unitId: string;
  conversionFactor: number;
};

export type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
  ledgerId: string;
  cost?: number;
  // Connections to masters
  itemTypeId: string;
  taxId: string;
  brandId?: string;
  unitId?: string;
  categoryId?: string;
  alternateUnits?: AlternateUnit[];
};

export type Service = {
  id: string;
  name: string;
  price: number;
}

export type JobStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export type JobOrderService = {
  serviceId: string;
  price: number;
};

export type TimeEntry = {
  startTime: string;
  endTime: string | null;
};

export type JobOrder = {
  id: string;
  services: JobOrderService[];
  customerId: string;
  technicianId: string;
  status: JobStatus;
  orderDate: string; // ISO string
  deadline: string; // ISO string
  timeEntries: TimeEntry[];
  notes: string;
  urgency: 'high' | 'medium' | 'low';
  price: number;
};

export type PrioritizedJobOrder = JobOrder & {
  priorityScore?: number;
  reason?: string;
};

export type Sale = {
  id: string;
  customerId: string;
  technicianId?: string;
  items: { itemId: string; quantity: number; price: number; taxRate?: number }[];
  total: number;
  paymentStatus: 'Paid' | 'Unpaid';
  date: string;
  invoiceDate?: string;
  paymentMode?: 'Cash' | 'Bank';
  paidAmount?: number;
};

export type ExpenseItem = {
    itemId: string;
    quantity: number;
    price: number;
    taxRate?: number;
};

export type Expense = {
  id: string;
  voucherNumber?: string;
  items: ExpenseItem[];
  total: number;
  description: string;
  date: string;
  payableToLedgerId?: string;
};

export type LedgerAccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export type LedgerAccount = {
  id: string;
  name: string;
  type: LedgerAccountType;
  description: string;
  openingBalance?: number;
  openingBalanceDate?: string;
};

type LedgerTransaction = {
  date: string;
  description: string;
  debit: number;
  credit: number;
};

export type FinancialReport = {
  accounts: {
    [key: string]: {
      debit: number;
      credit: number;
      balance: number;
      account: LedgerAccount;
      transactions: LedgerTransaction[];
    }
  },
  totals: {
    debit: number;
    credit: number;
  }
}

export type UserPermission =
  | 'dashboard'
  | 'jobs'
  | 'sales'
  | 'expenses'
  | 'customers'
  | 'technicians'
  | 'inventory'
  | 'chart-of-accounts'
  | 'reports'
  | 'users'
  | 'settings'
  | 'calendar';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  permissions: UserPermission[];
  technicianId?: string;
};

export type JournalEntry = {
    accountId: string;
    debit: number;
    credit: number;
};

export type JournalVoucher = {
    id: string;
    voucherNumber: string;
    date: string;
    narration: string;
    entries: JournalEntry[];
    total: number;
};

export type Survey = {
    id: string;
    jobId: string;
    customerId: string;
    rating: number;
    comments: string;
    date: string;
    serviceFeedback: {
        serviceId: string;
        photoUrl?: string;
    }[];
};

export type Appointment = {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  bookingType: 'Onsite' | 'Customer Location';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  address?: string;
  storeId?: string;
};

export type StoreLocation = {
  id: string;
  name: string;
  address: string;
};

export type Activity = {
  id: string;
  title: string;
  type: 'Call' | 'Follow-up' | 'Meeting' | 'Presentation' | 'Other';
  dueDate: string; // ISO string
  assignedToUserId: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  relatedTo?: {
    type: string; // 'job' or 'appointment'
    id: string;
  };
};
