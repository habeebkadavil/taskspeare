
"use client"
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "../ui/toaster";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlobalQuickAdd } from "../global-quick-add";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);

    const isLoginPage = pathname === '/login';
    const isCalendarPage = pathname === '/calendar';

    if (isLoginPage) {
        return (
            <>
                {children}
                <Toaster />
            </>
        );
    }
    
    if (loading || (!user && !isLoginPage)) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className={cn(
                        "flex-1 overflow-y-auto",
                        !isCalendarPage && "p-4 sm:p-6 lg:p-8"
                    )}>
                        {children}
                    </main>
                    <Toaster />
                    <GlobalQuickAdd />
                </div>
            </div>
        </SidebarProvider>
    )
}
