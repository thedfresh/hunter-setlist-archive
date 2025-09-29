export type Performance = {
  id: number;
  performanceOrder: number;
  song: { id: number; title: string };
  seguesInto: boolean;
  isTruncatedStart: boolean;
  isTruncatedEnd: boolean;
  hasCuts: boolean;
  isPartial: boolean;
  isUncertain: boolean;
  isSoloHunter: boolean;
  isLyricalFragment: boolean;
  isMusicalFragment: boolean;
  isMedley: boolean;
  publicNotes?: string;
  privateNotes?: string;
  leadVocals?: { id: number; name: string } | null;
  performanceMusicians: {
    id: number;
    musician: { id: number; name: string };
    instrument: { id: number; name: string } | null;
  }[];
};

export type Event = {
  id: number;
  year: number;
  month?: number;
  day?: number;
  displayDate?: string;
  venueId?: number;
  eventTypeId?: number;
  contentTypeId?: number;
  primaryBandId?: number;
  notes?: string;
  createdAt: string;
};

export type Set = {
  id: number;
  setTypeId: number;
  position: number;
  notes?: string;
  isUncertain?: boolean;
  setType: { id: number; name: string; displayName: string };
};