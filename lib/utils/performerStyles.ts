export function getPerformerCardClass(event: any): string {
    // Guest appearances (non-Hunter bands)
    if (event.primaryBand && event.primaryBand.isHunterBand === false) {
        return 'event-card-guest';
    }
    // Determine performer name
    const name = (event.primaryBand?.name || 'Solo').toLowerCase();
    // Return appropriate card class
    if (name === 'robert hunter' || name === 'solo') return 'event-card-solo';
    if (name.includes('roadhog')) return 'event-card-roadhog';
    if (name.includes('comfort')) return 'event-card-comfort';
    if (name.includes('dinosaurs')) return 'event-card-dinosaurs';
    return 'event-card-special';
}

export function getPerformerTextClass(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('roadhog')) return 'text-hunter-roadhog-primary';
    if (n.includes('comfort')) return 'text-hunter-comfort-primary';
    if (n.includes('dinosaurs')) return 'text-hunter-dinosaurs-primary';
    if (n.includes('special')) return 'text-hunter-special-primary';
    return 'text-hunter-solo-primary';
}
