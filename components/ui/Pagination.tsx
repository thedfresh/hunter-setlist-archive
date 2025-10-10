import Link from 'next/link';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    searchParams: Record<string, string>;
    basePath: string;
}

export default function Pagination({ currentPage, totalPages, searchParams, basePath }: PaginationProps) {
    const pageLinks = [];
    const maxPagesToShow = 7;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxPagesToShow) {
        if (currentPage <= 4) {
            endPage = maxPagesToShow;
        } else if (currentPage >= totalPages - 3) {
            startPage = totalPages - maxPagesToShow + 1;
        } else {
            startPage = currentPage - 3;
            endPage = currentPage + 3;
        }
    }

    // Previous link
    const prevParams = new URLSearchParams(searchParams);
    prevParams.set('page', (currentPage - 1).toString());

    // Next link
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', (currentPage + 1).toString());

    // Page number links
    for (let i = startPage; i <= endPage; i++) {
        const params = new URLSearchParams(searchParams);
        params.set('page', i.toString());
        pageLinks.push(
            <Link
                key={i}
                href={`${basePath}?${params.toString()}`}
                className={`page-link${i === currentPage ? ' page-link-active' : ''}`}
            >
                {i}
            </Link>
        );
    }

    return (
        <div className="pagination mt-6 flex gap-2 items-center justify-center">
            <Link
                href={`${basePath}?${prevParams.toString()}`}
                className="page-link"
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : 0}
            >
                Previous
            </Link>
            {startPage > 1 && <span className="page-link">...</span>}
            {pageLinks}
            {endPage < totalPages && <span className="page-link">...</span>}
            <Link
                href={`${basePath}?${nextParams.toString()}`}
                className="page-link"
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : 0}
            >
                Next
            </Link>
        </div>
    );
}
