export function PageContainer({
    children,
    variant = 'data'
}: {
    children: React.ReactNode;
    variant?: 'data' | 'text';
}) {
    if (variant === 'text') {
        return (
            <div className="px-4 md:px-10 py-6">
                <div className="md:ml-[180px] max-w-3xl transition-all duration-200">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-10 py-6">
            <div className="md:ml-[180px] max-w-6xl transition-all duration-200">
                {children}
            </div>
        </div>
    );
}