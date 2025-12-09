
'use client'

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser, auth as authService } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Bell } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { activities } from "@/lib/data";
import { Badge } from "../ui/badge";
import { companyDetails } from "@/lib/company";

const getTitleFromPathname = (pathname: string) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/masters')) {
        const subPath = pathname.split('/').pop();
        return `Masters / ${subPath?.charAt(0).toUpperCase()}${subPath?.slice(1).replace(/-/g, ' ')}`;
    }
    const title = pathname.split('/').pop()?.replace(/-/g, ' ');
    return title ? title.charAt(0).toUpperCase() + title.slice(1) : '';
}

export function Header() {
    const pathname = usePathname();
    const title = getTitleFromPathname(pathname);
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast({ title: 'Logged out successfully.' });
            router.push('/login');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Logout failed', description: error.message });
        }
    };
    
    // Calculate notifications for the current user
    const pendingActivitiesCount = user ? activities.filter(
        activity => activity.assignedToUserId === (user as any).id && 
                    (activity.status === 'Pending' || activity.status === 'In Progress')
    ).length : 0;

    return (
        <header className="sticky top-0 z-50 w-full bg-sidebar/95 backdrop-blur-sm rounded-b-lg">
            <div className="flex h-14 items-center px-4">
                <SidebarTrigger className="sm:hidden text-white" />
                <div className="flex-1 min-w-0 flex items-center">
                    <h1 className="text-xl font-semibold hidden md:block truncate text-white">{title}</h1>
                    <div className="hidden md:flex items-center ml-4 pl-4 border-l border-sidebar-border/50">
                        <div className="bg-sidebar-accent/50 px-3 py-1 rounded-md">
                            <span className="text-sm font-medium text-white">Welcome to {companyDetails.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <ThemeToggle />

                    <Link href="/activities" passHref>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-white" />
                            {pendingActivitiesCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">
                                    {pendingActivitiesCount}
                                </Badge>
                            )}
                            <span className="sr-only">View Activities</span>
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                                <Avatar>
                                    <AvatarImage src={(user as any)?.photoURL || "https://picsum.photos/seed/user/200/200"} alt="User Avatar" />
                                    <AvatarFallback>{(user as any)?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{(user as any)?.name || user?.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/settings" passHref>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem disabled>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
