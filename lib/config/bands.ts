export const BAND_CONFIG: Record<string, {
    cardClass: string;
    textClass: string;
    borderClass: string;
    lightBgClass: string;
    vocalsClass: string;
    displayName: string;
    order: number;
}> = {
    'Robert Hunter': {
        cardClass: 'event-card-solo',
        textClass: 'text-hunter-solo-primary',
        borderClass: 'event-border-solo',
        lightBgClass: 'bg-solo-light',
        vocalsClass: 'guest-vocals-special',
        displayName: 'Robert Hunter',
        order: 1
    },
    'Roadhog': {
        cardClass: 'event-card-roadhog',
        textClass: 'text-hunter-roadhog-primary',
        borderClass: 'event-border-roadhog',
        lightBgClass: 'bg-roadhog-light',
        vocalsClass: 'guest-vocals-roadhog',
        displayName: 'Roadhog',
        order: 2
    },
    'Comfort': {
        cardClass: 'event-card-comfort',
        textClass: 'text-hunter-comfort-primary',
        borderClass: 'event-border-comfort',
        lightBgClass: 'bg-comfort-light',
        vocalsClass: 'guest-vocals-comfort',
        displayName: 'Comfort',
        order: 3
    },
    'Dinosaurs': {
        cardClass: 'event-card-dinosaurs',
        textClass: 'text-hunter-dinosaurs-primary',
        borderClass: 'event-border-dinosaurs',
        lightBgClass: 'bg-dinosaurs-light',
        vocalsClass: 'guest-vocals-dinosaurs',
        displayName: 'Dinosaurs',
        order: 4
    }
};

export const DEFAULT_BAND_CONFIG = {
    cardClass: 'event-card-special',
    textClass: 'text-hunter-special-primary',
    borderClass: 'event-border-special',
    lightBgClass: 'bg-special-light',
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

export function getPerformerBorderColor(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return 'var(--color-guest)';
    }

    return getBandConfig(bandName).borderColor;
}

export function getPerformerLightBgClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return 'bg-guest-light';
    }

    return getBandConfig(bandName).lightBgClass;
}

export function getPerformerBorderClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return 'event-border-guest';
    }

    return getBandConfig(bandName).borderClass;
}
