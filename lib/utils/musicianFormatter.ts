export function addDisplayName<T extends { name: string; firstName?: string | null; lastName?: string | null }>(
    musician: T
): T & { displayName: string } {
    return {
        ...musician,
        displayName: musician.firstName && musician.lastName
            ? `${musician.firstName} ${musician.lastName}`
            : musician.name
    };
}

export function addDisplayNames<T extends { name: string; firstName?: string | null; lastName?: string | null }>(
    musicians: T[]
): Array<T & { displayName: string }> {
    return musicians.map(addDisplayName);
}
