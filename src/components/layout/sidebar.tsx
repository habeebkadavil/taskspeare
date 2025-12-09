'use client'

import Link from "next/link"
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation"
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    FileText,
    Receipt,
    Users,
    HardHat,
    Box,
    LogOut,
    BookUser,
    Settings,
    Banknote,
    Wallet,
    ShoppingBag,
    FilePieChart,
    BookMarked,
    Archive,
    Tags,
    Building,
    Ruler,
    Type,
    ListTodo,
    Scale,
    FileMinus,
    FilePlus,
    MessageSquare,
    ChevronDown,
    CalendarClock,
    ClipboardCheck,
    Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth, auth as authService } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { companyDetails } from "@/lib/company";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";


const mainMenuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
];

const taskMenuItems = [
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/appointments", label: "Appointments", icon: CalendarClock },
    { href: "/jobs", label: "Job Orders", icon: ListTodo },
    { href: "/activities", label: "Activities", icon: ClipboardCheck },
    { href: "/surveys", label: "Surveys", icon: MessageSquare },
]

const salesMenuItems = [
    { href: "/sales", label: "Sales Invoices", icon: FileText },
    { href: "/receipts", label: "Receipts", icon: Banknote },
    { href: "/credit-notes", label: "Credit Notes", icon: FileMinus },
]

const billsMenuItems = [
    { href: "/expenses", label: "Expenses", icon: Receipt },
    { href: "/payments", label: "Payments", icon: Wallet },
    { href: "/debit-notes", label: "Debit Notes", icon: FilePlus },
]

const masterMenuItems = [
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/technicians", label: "Technicians", icon: HardHat },
    { href: "/inventory", label: "Inventory", icon: Box },
    { href: "/masters/item-types", label: "Item Types", icon: Type },
    { href: "/masters/categories", label: "Categories", icon: Tags },
    { href: "/masters/taxes", label: "Taxes", icon: Scale },
    { href: "/masters/brands", label: "Brands", icon: Building },
    { href: "/masters/units", label: "Units", icon: Ruler },
];

const accountingMenuItems = [
    { href: "/chart-of-accounts", label: "Chart of Accounts", icon: BookUser },
    { href: "/journal-vouchers", label: "Journal Vouchers", icon: BookMarked },
    { href: "/reports?report=trial-balance", label: "Trial Balance", icon: FilePieChart },
    { href: "/reports?report=pnl", label: "Profit & Loss", icon: FilePieChart },
    { href: "/reports?report=balance-sheet", label: "Balance Sheet", icon: FilePieChart },
];

const reportsMenuItem = [
     { href: "/reports", label: "Reports", icon: FilePieChart },
];

const settingsMenuItems = [
    { href: "/users", label: "Users", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
];

const menuGroups = [
    { id: 'tasks', label: "Tasks", icon: ListTodo, items: taskMenuItems },
    { id: 'sales', label: "Sales", icon: ShoppingBag, items: salesMenuItems },
    { id: 'bills', label: "Bills", icon: BookMarked, items: billsMenuItems },
    { id: 'masters', label: "Masters", icon: Archive, items: masterMenuItems },
    { id: 'accounting', label: "Accounting", icon: BookUser, items: accountingMenuItems },
    { id: 'reports', label: "Reports", icon: FilePieChart, items: reportsMenuItem },
    { id: 'settings', label: "Settings", icon: Settings, items: settingsMenuItems },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

    useEffect(() => {
        // Find which group is active and open it
        for (const group of menuGroups) {
            if (group.items.some(item => isMenuItemActive(item.href))) {
                setOpenCollapsible(group.id);
                return; // Stop after finding the first active group
            }
        }
        // If no group is active, check main menu items
        if (mainMenuItems.some(item => pathname === item.href)) {
             setOpenCollapsible(null); // No group is open
        }

    }, [pathname]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast({ title: 'Logged out successfully.' });
            router.push('/login');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Logout failed', description: error.message });
        }
    };
    
    const handleCollapsibleChange = (id: string) => {
        setOpenCollapsible(prev => (prev === id ? null : id));
    };

    const isMenuItemActive = (href: string) => {
        // Exact match for homepage, startsWith for other pages
        return href === '/' ? pathname === href : pathname.startsWith(href);
    };
    
    const MenuItemGroup = ({ id, label, icon: Icon, items }: { id: string, label: string, icon: React.ElementType, items: {href: string, label: string, icon: React.ElementType}[] }) => {
        const isOpen = openCollapsible === id;
        const isGroupActive = items.some(item => isMenuItemActive(item.href));

        return (
            <Collapsible open={isOpen} onOpenChange={() => handleCollapsibleChange(id)}>
                <CollapsibleTrigger asChild>
                     <SidebarMenuButton
                        isActive={isGroupActive && !isOpen}
                        className="w-full font-semibold"
                        variant="ghost"
                        size="default"
                    >
                        <Icon />
                        <span>{label}</span>
                        <ChevronDown className={cn("ml-auto h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="py-1">
                        {items.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href} passHref>
                                    <SidebarMenuButton
                                        isActive={isMenuItemActive(item.href)}
                                        className="w-full"
                                        isSubmenu={true}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-3">
                    {companyDetails.logoUrl && (
                        <Image src={companyDetails.logoUrl} alt="Company Logo" width={32} height={32} className="object-contain rounded-md" data-ai-hint="logo" />
                    )}
                    <span className="text-lg font-semibold text-sidebar-foreground">{companyDetails.name}</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    {mainMenuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href} passHref>
                                <SidebarMenuButton
                                    isActive={isMenuItemActive(item.href)}
                                    className="w-full font-semibold"
                                    variant="ghost"
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                
                {menuGroups.map(group => <MenuItemGroup key={group.id} {...group} />)}

            </SidebarContent>
            <SidebarFooter className="p-2 flex flex-col gap-2 border-t border-sidebar-border">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
