import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.href ? (
                        <Link href={item.href} className="breadcrumb-link">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <span className="breadcrumb-separator">/</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
