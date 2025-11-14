export function PageContainer({
    children,
    variant = 'data'
}: {
    children: React.ReactNode;
    variant?: 'data' | 'text' | 'detail';
}) {
    // Text pages (About, Guides) - 800px max, single column
    if (variant === 'text') {
        return (
            <div className="page-container-text">
                {children}
            </div>
        );
    }

    // Detail pages with sidebar support - 1400px max
    // Children should use detail-layout-sidebar or detail-layout-full classes
    if (variant === 'detail') {
        return (
            <div className="page-container-detail">
                {children}
            </div>
        );
    }

    // Browse/data pages (Events list, Songs list, Homepage) - 1280px max
    return (
        <div className="page-container-data">
            {children}
        </div>
    );
}