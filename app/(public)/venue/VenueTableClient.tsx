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
  const sortedVenues = sortVenues(venues, sortKey, sortDir);

  function handleSort(colKey: string) {
    if (sortKey === colKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(colKey);
      setSortDir('asc');
    }
  }

  return (
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
  );
}
