# Glossary

- **Event**: A dated appearance. May be partial date. Contains Sets.
- **Set**: Ordered block within an Event. Types: Set 1, Set 2, Encore, Soundcheck.
- **Performance**: A song in a Set with order and flags (segues, truncation, Hunter participation).
- **Recording**: Reference to an extant source; type ∈ {SBD, Audience, FM, Matrix, Video}.
- **Musician vs Band**: Individuals vs recurring ensembles (Dinosaurs, Comfort, Roadhog).
- **Contributor**: Person credited for data or tape lineage.
- **Dialog**: Spoken text captured around songs; stored in `show_dialog`.
- **Album**: Collection of songs with release information and track listings.
- **Tag**: Categorization system for songs (suites, themes, influences like "dylan", "garcia-hunter").
- **Instrument**: Musical instrument classification for musician participation (vocals, guitar, bass, etc.).
- **Default Instrument**: Pre-assigned instruments for musicians to reduce repetitive data entry.
- **Note**: Reusable annotation that can be linked to events, sets, or performances via junction table.
- **Junction Tables**: Tables managing many-to-many relationships (MusicianDefaultInstrument, SongAlbum, SongTag).
- **Three-state Boolean**: `true/false/null` to encode unknown distinctly from verified absence.
- **Verified**: Event setlist verified against a recording (vs. reported setlist).