import { create } from 'zustand';

type QuickAddDialog = 'add-customer' | 'add-job' | 'add-sale' | 'add-expense' | null;

type QuickAddStore = {
  dialog: QuickAddDialog;
  open: (dialog: QuickAddDialog) => void;
  close: () => void;
};

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  dialog: null,
  open: (dialog) => set({ dialog }),
  close: () => set({ dialog: null }),
}));
