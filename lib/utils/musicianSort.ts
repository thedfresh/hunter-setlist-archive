export function compareMusicianNames(
    a: { name?: string | null; firstName?: string | null; lastName?: string | null },
    b: { name?: string | null; firstName?: string | null; lastName?: string | null }
): number {
    const aSort = a.lastName || a.name || '';
    const bSort = b.lastName || b.name || '';

    const lastNameCompare = aSort.localeCompare(bSort);
    if (lastNameCompare !== 0) return lastNameCompare;

    const aFirst = a.firstName || '';
    const bFirst = b.firstName || '';
    return aFirst.localeCompare(bFirst);
}

export function getPrismaMusicianOrderBy() {
    return { name: 'asc' as const };
}