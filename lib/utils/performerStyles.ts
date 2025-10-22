import { getBandConfig } from '@/lib/config/bands';

// lib/utils/performerStyles.ts
export function getPerformerCardClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    // Guest appearances
    if (isHunterBand === false) {
        return 'event-card-guest';
    }

    // Hunter's bands
    return getBandConfig(bandName).cardClass;
}
export function getPerformerTextClass(name: string): string {
    return getBandConfig(name).cardClass;
}
