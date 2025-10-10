"use client";
import { useState } from 'react';
import Link from 'next/link';

const columns = [
  { key: 'name', label: 'Venue Name' },
  { key: 'city', label: 'City' },
  { key: 'stateProvince', label: 'State' },
  { key: 'showCount', label: 'Show Count' },
];

function sortVenues(venues: any[], sortKey: string, sortDir: 'asc' | 'desc') {
  function stripThe(str: string) {
    return str.replace(/^the\s+/i, '');
  }
  return [...venues].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === 'showCount') {
      aVal = a._count.events;
      bVal = b._count.events;
    }
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') {
      aVal = stripThe(aVal);
      bVal = stripThe(bVal);
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

export default function VenueTableClient({ venues }: { venues: any[] }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState("");

  // Filter venues by all relevant fields
  const filteredVenues = search.trim() === ""
    ? venues
    : venues.filter(v => {
      const q = search.trim().toLowerCase();
      return (
        v.name?.toLowerCase().includes(q) ||
        v.context?.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q) ||
        v.stateProvince?.toLowerCase().includes(q) ||
        v.country?.toLowerCase().includes(q)
      );
    });
  const sortedVenues = sortVenues(filteredVenues, sortKey, sortDir);

  function handleSort(colKey: string) {
    if (sortKey === colKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(colKey);
      setSortDir('asc');
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Venues</div>
      </div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="page-subtitle w-full">{sortedVenues.length} venues found</div>
        <div className="search-bar w-full sm:w-96">
          <input
            className="search-input-large"
            placeholder="Search venues..."
            value={search}
            onChange={handleSearchChange}
          />
          <span className="search-icon-large">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="sortable cursor-pointer"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedVenues.map((venue: any) => (
              <tr key={venue.id}>
                <td>
                  <Link href={`/venue/${venue.slug}`} className="link-internal">
                    {venue.name} {venue.context ? `(${venue.context})` : null}
                  </Link>
                </td>
                <td>{venue.city || ''}</td>
                <td>{venue.stateProvince || ''}</td>
                <td>{venue._count.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
