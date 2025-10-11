"use client";
import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/ui/SiteHeader';
import Footer from '@/components/ui/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    return (
        <ToastProvider>
            {!isAdminRoute && <SiteHeader />}
            <main className="flex-1">{children}</main>
            {!isAdminRoute && <Footer />}
        </ToastProvider>
    );
}
