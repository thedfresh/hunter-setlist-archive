"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';

export default function AdminPageLayout({
    children,
    breadcrumbs,
    title
}: {
    children: React.ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    title?: string;
}) {
    const pathname = usePathname();

    const navItems = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: 'Songs', href: '/admin/songs' },
        { label: 'Venues', href: '/admin/venues' },
        { label: 'Bands', href: '/admin/bands' },
        { label: 'Musicians', href: '/admin/musicians' },
        { label: 'Contributors', href: '/admin/contributors' },
        { label: 'Albums', href: '/admin/albums' },
        { label: 'Tags', href: '/admin/tags' },
        { label: 'Instruments', href: '/admin/instruments' },
    ];

    const referenceItems = [
        { label: 'Event Types', href: '/admin/event-types' },
        { label: 'Content Types', href: '/admin/content-types' },
        { label: 'Set Types', href: '/admin/set-types' },
        { label: 'Recording Types', href: '/admin/recording-types' },
        { label: 'Link Types', href: '/admin/link-types' },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Sidebar - use admin classes from globals.css */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-title">Archive Admin</div>
                    <div className="admin-subtitle">Hunter Performance Database</div>
                </div>

                <nav className="admin-nav">
                    <ul className="admin-nav-list">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href} className="admin-nav-item">
                                    <Link
                                        href={item.href}
                                        className={isActive ? 'admin-nav-link admin-nav-link-active' : 'admin-nav-link'}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* Reference Data section */}
                        <hr className="admin-nav-divider" />
                        <div className="admin-nav-section-title">Reference Data</div>

                        {referenceItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href} className="admin-nav-item">
                                    <Link
                                        href={item.href}
                                        className={isActive ? 'admin-nav-link admin-nav-link-active' : 'admin-nav-link'}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="admin-sidebar-footer">
                    <Link href="/" className="admin-footer-link">
                        <span>←</span>
                        <span>Back to Public Site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-content-wrapper">
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <Breadcrumbs items={breadcrumbs} />
                    )}

                    {title && <h1 className="page-title">{title}</h1>}

                    {children}
                </div>
            </main>
        </div>
    );
}