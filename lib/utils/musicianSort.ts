export function compareMusicianNames(
    a: { name: string; firstName?: string | null; lastName?: string | null },
    b: { name: string; firstName?: string | null; lastName?: string | null }
): number {
    // Use lastName for sorting if available, otherwise name
    const aSort = a.lastName || a.name;
    const bSort = b.lastName || b.name;

    const lastNameCompare = aSort.localeCompare(bSort);
    if (lastNameCompare !== 0) return lastNameCompare;

    // If lastNames match, sort by firstName
    const aFirst = a.firstName || '';
    const bFirst = b.firstName || '';
    return aFirst.localeCompare(bFirst);
}

export function getPrismaMusicianOrderBy() {
    // Prisma can't do conditional ordering, so fetch all and sort in memory
    return { name: 'asc' as const };  // Placeholder - will sort in memory
}
