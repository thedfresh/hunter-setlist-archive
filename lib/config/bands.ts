export const BAND_CONFIG: Record<string, {
    cardClass: string;
    textClass: string;
    borderClass: string;
    headerBorderClass: string;
    lightBgClass: string;
    vocalsClass: string;
    ghostButtonClass: string;
    displayName: string;
    order: number;
}> = {
    'Robert Hunter': {
        cardClass: 'event-card-solo',
        textClass: 'text-hunter-solo-primary',
        borderClass: 'event-border-solo',
        headerBorderClass: 'header-border-solo',
        lightBgClass: 'bg-solo-light',
        vocalsClass: 'guest-vocals-special',
        ghostButtonClass: 'btn-ghost-solo',
        displayName: 'Robert Hunter',
        order: 1
    },
    'Roadhog': {
        cardClass: 'event-card-roadhog',
        textClass: 'text-hunter-roadhog-primary',
        borderClass: 'event-border-roadhog',
        headerBorderClass: 'header-border-roadhog',
        lightBgClass: 'bg-roadhog-light',
        vocalsClass: 'guest-vocals-roadhog',
        ghostButtonClass: 'btn-ghost-roadhog',
        displayName: 'Roadhog',
        order: 2
    },
    'Comfort': {
        cardClass: 'event-card-comfort',
        textClass: 'text-hunter-comfort-primary',
        borderClass: 'event-border-comfort',
        headerBorderClass: 'header-border-comfort',
        lightBgClass: 'bg-comfort-light',
        vocalsClass: 'guest-vocals-comfort',
        ghostButtonClass: 'btn-ghost-comfort',
        displayName: 'Comfort',
        order: 3
    },
    'Dinosaurs': {
        cardClass: 'event-card-dinosaurs',
        textClass: 'text-hunter-dinosaurs-primary',
        borderClass: 'event-border-dinosaurs',
        headerBorderClass: 'header-border-dinosaurs',
        lightBgClass: 'bg-dinosaurs-light',
        vocalsClass: 'guest-vocals-dinosaurs',
        ghostButtonClass: 'btn-ghost-dinosaurs',
        displayName: 'Dinosaurs',
        order: 4
    },
    'Guest Appearances': {
        cardClass: 'event-card-guest',
        textClass: 'text-gray-600',
        borderClass: 'event-border-guest',
        headerBorderClass: 'header-border-guest',
        lightBgClass: 'bg-guest-light',
        vocalsClass: 'guest-vocals-special',
        ghostButtonClass: 'btn-ghost-guest',
        displayName: 'Guest Appearances',
        order: 5
    }
};

export const DEFAULT_BAND_CONFIG = {
    cardClass: 'event-card-special',
    textClass: 'text-hunter-special-primary',
    borderClass: 'event-border-special',
    headerBorderClass: 'header-border-special',
    lightBgClass: 'bg-special-light',
    vocalsClass: 'guest-vocals-special',
    ghostButtonClass: 'btn-ghost-special',
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

export function getPerformerLightBgClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return getBandConfig('Guest Appearances').lightBgClass;
    }

    return getBandConfig(bandName).lightBgClass;
}

export function getPerformerBorderClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return getBandConfig('Guest Appearances').borderClass;
    }

    return getBandConfig(bandName).borderClass;
}

export function getPerformerHeaderBorderClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return getBandConfig('Guest Appearances').headerBorderClass;
    }

    return getBandConfig(bandName).headerBorderClass;
}

export function getPerformerGhostButtonClass(event: any): string {
    const bandName = event?.primaryBand?.name;
    const isHunterBand = event?.primaryBand?.isHunterBand;

    if (isHunterBand === false) {
        return getBandConfig('Guest Appearances').ghostButtonClass;
    }

    return getBandConfig(bandName).ghostButtonClass;
}
