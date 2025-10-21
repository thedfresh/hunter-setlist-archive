import { getBandConfig } from '@/lib/config/bands';

export function getPerformerCardClass(event: any): string {
    return getBandConfig(event?.primaryBand?.name).cardClass;
}

export function getPerformerTextClass(name: string): string {
    return getBandConfig(name).cardClass;
}
