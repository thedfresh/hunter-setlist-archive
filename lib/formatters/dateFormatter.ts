export interface EventDateLike {
    year?: number | null;
    month?: number | null;
    day?: number | null;
    showTiming?: string | null;
}

export function formatEventDate(event: EventDateLike): string {
    if (!event || !event.year) return '';
    const year = event.year;
    const month = event.month ? String(event.month).padStart(2, '0') : 'xx';
    const day = event.day ? String(event.day).padStart(2, '0') : 'xx';
    let result = `${year}-${month}-${day}`;
    if (event.showTiming) {
        const timing = event.showTiming.trim().toLowerCase();
        if (timing === 'early' || timing === 'late') {
            result += ` (${timing.charAt(0).toUpperCase() + timing.slice(1)})`;
        }
    }
    return result;
}