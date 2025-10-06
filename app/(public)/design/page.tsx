
'use client';
import React from 'react';

const performerCards = [
  { className: 'event-card event-card-solo', name: 'Solo Hunter', songs: ['Box of Rain', 'Rubin & Cherise'] },
  { className: 'event-card event-card-roadhog', name: 'Roadhog', songs: ['Promontory Rider', 'Tiger Rose'] },
  { className: 'event-card event-card-comfort', name: 'Comfort', songs: ['Boys in the Barroom', 'It Must Have Been the Roses'] },
  { className: 'event-card event-card-dinosaurs', name: 'Dinosaurs', songs: ['Friend of the Devil', 'Ripple'] },
  { className: 'event-card event-card-special', name: 'Special Ensemble', songs: ['Stagger Lee', 'Terrapin Station'] },
];

const badgeTypes = [
  { className: 'badge badge-verified', label: 'Verified' },
  { className: 'badge badge-uncertain', label: 'Uncertain' },
  { className: 'badge badge-sbd', label: 'SBD' },
  { className: 'badge badge-aud', label: 'AUD' },
  { className: 'badge badge-neutral', label: 'Neutral' },
];

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-10">Design System Reference</h1>

      {/* Section 1 - Colors */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Performer Card Styles</h2>
        <div className="flex flex-wrap gap-6">
          {performerCards.map((card) => (
            <div key={card.name} className={card.className + ' w-56 p-4'}>
              <div className="font-semibold mb-2">{card.name}</div>
              <ul className="text-xs text-gray-700 list-disc ml-5">
                {card.songs.map((song) => (
                  <li key={song}>{song}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 9 - Alerts */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Alerts</h2>
        <div className="flex flex-col gap-4">
          <div className="alert alert-info">
            <span className="alert-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" /><circle cx="12" cy="16" r="1" /></svg>
            </span>
            <div className="alert-content">
              <div className="alert-title">Info Alert</div>
              <div className="alert-description">This is an informational message.</div>
            </div>
            <button className="alert-close" aria-label="Close">×</button>
          </div>
          <div className="alert alert-success">
            <span className="alert-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M8 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="alert-content">
              <div className="alert-title">Success Alert</div>
              <div className="alert-description">Your action was successful.</div>
            </div>
            <button className="alert-close" aria-label="Close">×</button>
          </div>
          <div className="alert alert-warning">
            <span className="alert-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="13" strokeWidth="2" /><circle cx="12" cy="16" r="1" /></svg>
            </span>
            <div className="alert-content">
              <div className="alert-title">Warning Alert</div>
              <div className="alert-description">Please double-check your input.</div>
            </div>
            <button className="alert-close" aria-label="Close">×</button>
          </div>
          <div className="alert alert-error">
            <span className="alert-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" /><line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" /></svg>
            </span>
            <div className="alert-content">
              <div className="alert-title">Error Alert</div>
              <div className="alert-description">Something went wrong. Please try again.</div>
            </div>
            <button className="alert-close" aria-label="Close">×</button>
          </div>
        </div>
      </section>

      {/* Section 10 - Modal Examples */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Modal Examples</h2>
        <button className="btn btn-primary btn-medium mb-6" onClick={() => setModalOpen(true)}>
          Show Modal Example
        </button>
        {modalOpen && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <span className="modal-title">Delete Event?</span>
                <button className="modal-close" aria-label="Close" onClick={() => setModalOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this event? This action cannot be undone.
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-medium" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-danger btn-medium" onClick={() => setModalOpen(false)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 11 - Tooltips */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Tooltips</h2>
        <div className="flex items-center gap-8">
          <div className="tooltip-container">
            <button className="btn btn-secondary btn-medium">Hover me</button>
            <span className="tooltip">This is a tooltip!</span>
          </div>
          <span className="text-sm text-gray-500">(Hover to see tooltip)</span>
        </div>
      </section>

      {/* Section 12 - Event Cards (Browse View) */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Event Cards (Browse View)</h2>
        <div className="flex gap-6 flex-wrap">
          <div className="event-card event-card-solo w-72 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">08/07/2002</span>
              <span className="badge badge-verified">Verified</span>
            </div>
            <div className="text-base font-semibold mb-1">Solo Hunter</div>
            <div className="text-xs text-gray-600 mb-1">Fillmore, SF</div>
            <div className="flex gap-2 mt-2">
              <button className="action-btn">View</button>
              <button className="action-btn">Edit</button>
            </div>
          </div>
          <div className="event-card event-card-dinosaurs w-72 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">12/31/1978</span>
              <span className="badge badge-verified">Verified</span>
            </div>
            <div className="text-base font-semibold mb-1">Dinosaurs</div>
            <div className="text-xs text-gray-600 mb-1">Winterland, SF</div>
            <div className="flex gap-2 mt-2">
              <button className="action-btn">View</button>
              <button className="action-btn">Edit</button>
            </div>
          </div>
          <div className="event-card event-card-comfort w-72 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">05/15/1982</span>
              <span className="badge badge-verified">Verified</span>
            </div>
            <div className="text-base font-semibold mb-1">Comfort</div>
            <div className="text-xs text-gray-600 mb-1">Greek Theatre, Berkeley</div>
            <div className="flex gap-2 mt-2">
              <button className="action-btn">View</button>
              <button className="action-btn">Edit</button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Buttons */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-col gap-6">
          <div className="button-group flex gap-3">
            <button className="btn btn-primary btn-large">Primary Large</button>
            <button className="btn btn-secondary btn-large">Secondary Large</button>
            <button className="btn btn-success btn-large">Success Large</button>
            <button className="btn btn-danger btn-large">Danger Large</button>
            <button className="btn btn-ghost btn-large">Ghost Large</button>
          </div>
          <div className="button-group flex gap-3">
            <button className="btn btn-primary btn-medium">Primary Medium</button>
            <button className="btn btn-secondary btn-medium">Secondary Medium</button>
            <button className="btn btn-success btn-medium">Success Medium</button>
            <button className="btn btn-danger btn-medium">Danger Medium</button>
            <button className="btn btn-ghost btn-medium">Ghost Medium</button>
          </div>
          <div className="button-group flex gap-3">
            <button className="btn btn-primary btn-small">Primary Small</button>
            <button className="btn btn-secondary btn-small">Secondary Small</button>
            <button className="btn btn-success btn-small">Success Small</button>
            <button className="btn btn-danger btn-small">Danger Small</button>
            <button className="btn btn-ghost btn-small">Ghost Small</button>
          </div>
        </div>
      </section>

      {/* Section 3 - Forms */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Forms</h2>
        <form className="flex flex-col gap-6">
          <div>
            <label className="form-label form-label-required">Text Input</label>
            <input className="input" placeholder="Type here..." />
          </div>
          <div>
            <label className="form-label">Textarea</label>
            <textarea className="textarea" placeholder="Write something..." />
          </div>
          <div>
            <label className="form-label">Select</label>
            <select className="select">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="form-label">Input Error</label>
              <input className="input input-error" placeholder="Error state" />
              <div className="form-error">This field is required.</div>
            </div>
            <div>
              <label className="form-label">Input Success</label>
              <input className="input input-success" placeholder="Success state" />
              <div className="form-success">Looks good!</div>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <label className="form-label">Checkboxes</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" /> Option 1
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" /> Option 2
                </label>
              </div>
            </div>
            <div>
              <label className="form-label">Radios</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="radio-demo" className="radio-input" /> Radio 1
                </label>
                <label className="radio-label">
                  <input type="radio" name="radio-demo" className="radio-input" /> Radio 2
                </label>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Section 4 - Badges */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <div className="flex gap-2 items-center flex-wrap">
          {badgeTypes.map((badge) => (
            <span key={badge.label} className={badge.className}>{badge.label}</span>
          ))}
        </div>
      </section>

      {/* Section 5 - Navigation */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        {/* Breadcrumbs */}
        <div className="breadcrumbs mb-4">
          <a className="breadcrumb-link" href="#">Home</a>
          <span className="breadcrumb-separator">/</span>
          <a className="breadcrumb-link" href="#">Shows</a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">1978-12-31</span>
        </div>
        {/* Tabs underline */}
        <div className="tabs mb-4">
          <div className="tab tab-active">Details</div>
          <div className="tab">Setlist</div>
          <div className="tab">Recordings</div>
        </div>
        {/* Tabs pills */}
        <div className="tabs-pills mb-4">
          <div className="tab-pill tab-pill-active">Overview</div>
          <div className="tab-pill">Songs</div>
          <div className="tab-pill">Venues</div>
        </div>
        {/* Pagination */}
        <div className="pagination">
          <button className="page-link" disabled>{'<'}</button>
          <button className="page-link page-link-active">1</button>
          <button className="page-link">2</button>
          <button className="page-link">3</button>
          <span className="page-ellipsis">...</span>
          <button className="page-link">10</button>
          <button className="page-link">{'>'}</button>
        </div>
      </section>
      {/* Section 6 - Tables */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Tables</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable">Date</th>
                <th className="sortable">Venue</th>
                <th className="sortable">Performer</th>
                <th className="sortable">Status</th>
                <th className="sortable">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>08/07/2002</td>
                <td>Fillmore, SF</td>
                <td>Solo Hunter</td>
                <td><span className="badge badge-verified">Verified</span></td>
                <td className="table-actions">
                  <button className="action-btn">Edit</button>
                  <button className="action-btn">Delete</button>
                </td>
              </tr>
              <tr>
                <td>12/31/1978</td>
                <td>Winterland, SF</td>
                <td>Dinosaurs</td>
                <td><span className="badge badge-verified">Verified</span></td>
                <td className="table-actions">
                  <button className="action-btn">Edit</button>
                  <button className="action-btn">Delete</button>
                </td>
              </tr>
              <tr>
                <td>05/15/1982</td>
                <td>Greek Theatre, Berkeley</td>
                <td>Comfort</td>
                <td><span className="badge badge-verified">Verified</span></td>
                <td className="table-actions">
                  <button className="action-btn">Edit</button>
                  <button className="action-btn">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7 - Search & Filters */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Search & Filters</h2>
        <div className="search-bar mb-6">
          <input className="search-input-large" placeholder="Search shows, songs, venues..." />
          <span className="search-icon-large">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <div className="filter-chips mb-4">
          <span className="filter-chip filter-chip-active">Band: Comfort</span>
          <span className="filter-chip filter-chip-active">Year: 1982</span>
          <span className="filter-chip filter-chip-active">Venue: Greek Theatre</span>
        </div>
        <div className="sort-control">
          <span className="sort-label">Sort by:</span>
          <span className="sort-value">Date</span>
          <span className="sort-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </section>

      {/* Section 8 - Empty/Loading States */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">States</h2>
        <div className="empty-state mb-8">
          <div className="empty-icon">
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64" stroke="currentColor">
              <circle cx="32" cy="32" r="28" strokeWidth="4" className="text-gray-300" />
              <line x1="20" y1="44" x2="44" y2="44" strokeWidth="3" className="text-gray-300" />
              <circle cx="26" cy="28" r="2" fill="currentColor" />
              <circle cx="38" cy="28" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="empty-title">No Results</div>
          <div className="empty-description">Try adjusting your search or filters.</div>
        </div>
        <div className="loading-state mb-8">
          <div className="spinner"></div>
          <div className="loading-text">Loading data...</div>
        </div>
        <div className="mb-8">
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line skeleton-line-short"></div>
        </div>
      </section>
    </div>
  );
}
