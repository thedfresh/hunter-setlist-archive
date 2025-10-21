export const BAND_CONFIG: Record<string, {
    cardClass: string;
    vocalsClass: string;
    displayName: string;
    order: number;
}> = {
    'Robert Hunter': {
        cardClass: 'event-card-solo',
        vocalsClass: 'guest-vocals-special',
        displayName: 'Robert Hunter',
        order: 1
    },
    'Roadhog': {
        cardClass: 'event-card-roadhog',
        vocalsClass: 'guest-vocals-roadhog',
        displayName: 'Roadhog',
        order: 2
    },
    'Comfort': {
        cardClass: 'event-card-comfort',
        vocalsClass: 'guest-vocals-comfort',
        displayName: 'Comfort',
        order: 3
    },
    'Dinosaurs': {
        cardClass: 'event-card-dinosaurs',
        vocalsClass: 'guest-vocals-dinosaurs',
        displayName: 'Dinosaurs',
        order: 4
    }
};

export const DEFAULT_BAND_CONFIG = {
    cardClass: 'event-card-special',
    vocalsClass: 'guest-vocals-special',
    displayName: 'Ad Hoc Bands',
    order: 99
};

export function getBandConfig(bandName: string | null | undefined) {
    if (!bandName) return DEFAULT_BAND_CONFIG;
    return BAND_CONFIG[bandName] || DEFAULT_BAND_CONFIG;
}

export function getGuestVocalsClass(bandName: string | null | undefined): string {
    return getBandConfig(bandName).vocalsClass;
}

export function getPerformerCardClass(bandName: string | null | undefined): string {
    return getBandConfig(bandName).cardClass;
}
