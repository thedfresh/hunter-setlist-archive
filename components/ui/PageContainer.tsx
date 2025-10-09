export function PageContainer({
    children,
    variant = 'data'
}: {
    children: React.ReactNode;
    variant?: 'data' | 'text';
}) {
    if (variant === 'text') {
        return (
            <div className="px-10 py-6">
                <div className="ml-[180px] max-w-3xl">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="px-10 py-6">
            <div className="ml-[180px] max-w-6xl">
                {children}
            </div>
        </div>
    );
}