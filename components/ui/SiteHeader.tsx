"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Suggestion = {
  type: string;
  value: string;
  label: string;
  bandId?: number;
  musicianId?: number;
  bandIds?: number[];
  musicianIds?: number[];
};

const SiteHeader = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [browseMenuOpen, setBrowseMenuOpen] = useState(false);
  const [guidesMenuOpen, setGuidesMenuOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const guidesRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => { if (res.ok) setIsAdmin(true); })
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => { setSelectedIndex(-1); }, [suggestions]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      fetch(`/api/events/search-suggestions?q=${encodeURIComponent(query)}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => {
          const breakdown = data.suggestions || [];
          const filtered = breakdown.filter((option: any) => {
            if (option.type === 'person-all' || option.type === 'person-primary' ||
              option.type === 'person-guest' || option.type === 'band') return true;
            if (option.type === 'person-band') {
              const parts = option.label.match(/^(.+?) with (.+?) \(/);
              if (parts) {
                return parts[1].toLowerCase().trim() !== parts[2].toLowerCase().trim();
              }
            }
            return true;
          });
          setSuggestions(filtered);
        })
        .catch(() => setSuggestions([]));
    }, 100);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) setBrowseMenuOpen(false);
      if (guidesRef.current && !guidesRef.current.contains(event.target as Node)) setGuidesMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchBlur = () => setTimeout(() => setShowSearchDropdown(false), 150);

  const handleSuggestionClick = (s: Suggestion) => {
    setShowSearchDropdown(false);
    setQuery("");
    const params = new URLSearchParams();
    params.set('search', s.value);
    params.set('searchType', s.type);
    if (s.type === 'person-band') {
      if (s.bandId) params.set('bandId', s.bandId.toString());
      if (s.musicianId) params.set('musicianId', s.musicianId.toString());
    } else if (s.type === 'person-all') {
      if (s.bandIds) params.set('bandIds', s.bandIds.join(','));
      if (s.musicianIds) params.set('musicianIds', s.musicianIds.join(','));
    } else if (s.type === 'person-guest') {
      if (s.musicianIds) params.set('musicianIds', s.musicianIds.join(','));
    }
    router.push(`/event?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      if (selected) handleSuggestionClick(selected);
    }
  };

  const SearchInput = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`relative ${isMobile ? 'flex-1 min-w-0' : 'w-full'}`}>
      <input
        ref={isMobile ? inputRef : undefined}
        type="text"
        className={isMobile ? "w-full px-3 py-1.5 pl-9 text-sm border border-gray-300 rounded-md" : "header-search-box w-full"}
        placeholder={isMobile ? "Search..." : "Search dates, venues, bands..."}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.length >= 2) setShowSearchDropdown(true);
        }}
        onFocus={() => setShowSearchDropdown(true)}
        onBlur={handleSearchBlur}
        onKeyDown={handleKeyDown}
      />
      <svg
        className={`absolute ${isMobile ? 'left-2.5 w-3.5 h-3.5' : 'left-3 w-4 h-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle cx="11" cy="11" r="7" strokeWidth="2" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {showSearchDropdown && suggestions.length > 0 && (
        <div
          ref={searchDropdownRef}
          className={`absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto ${isMobile ? 'max-h-52' : 'max-h-64'}`}
        >
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 cursor-pointer text-sm ${idx === selectedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
              onMouseDown={() => handleSuggestionClick(s)}
            >
              <span className="font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const NavLinks = () => (
    <>
      <Link href="/event" className="nav-link">Events</Link>
      <Link href="/song" className="nav-link">Songs</Link>

      <div className="relative" ref={browseRef}>
        <button
          className="nav-link flex items-center gap-1"
          onClick={() => {
            setBrowseMenuOpen(!browseMenuOpen);
            setGuidesMenuOpen(false);
          }}
        >
          Browse
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {browseMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
            <Link href="/band" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setBrowseMenuOpen(false)}>
              Bands & Musicians
            </Link>
            <Link href="/venue" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setBrowseMenuOpen(false)}>
              Venues
            </Link>
            <Link href="/album" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setBrowseMenuOpen(false)}>
              Albums
            </Link>
          </div>
        )}
      </div>

      <div className="relative" ref={guidesRef}>
        <button
          className="nav-link flex items-center gap-1"
          onClick={() => {
            setGuidesMenuOpen(!guidesMenuOpen);
            setBrowseMenuOpen(false);
          }}
        >
          Guides
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {guidesMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
            <Link href="/guides/getting-started" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setGuidesMenuOpen(false)}>
              Getting Started
            </Link>
            <Link href="/guides/deep-dives" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setGuidesMenuOpen(false)}>
              Deep Dives
            </Link>
            <Link href="/guides/researchers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setGuidesMenuOpen(false)}>
              For Researchers
            </Link>
            <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setGuidesMenuOpen(false)}>
              Blog & Updates
            </Link>
          </div>
        )}
      </div>

      <Link href="/about" className="nav-link">About</Link>

      {isAdmin && (
        <>
          <span className="text-gray-300 mx-2">|</span>
          <Link href="/admin" className="nav-link">Admin</Link>
        </>
      )}
    </>
  );

  return (
    <header className="site-header sticky top-0 z-50">

      <div className="hidden xl:flex px-4 md:px-10">
        <div className="flex items-center h-20 w-full max-w-7xl mx-auto gap-6">
          <Link href="/" className="flex-shrink-0">
            <Image src="/images/still-unsung-logo.png" alt="StillUnsung.com" width={80} height={80} className="w-auto h-16" />
          </Link>
          <nav className="flex items-center gap-6 flex-shrink-0">
            <NavLinks />
          </nav>
          <div className="flex-1 min-w-[280px]">
            <SearchInput />
          </div>
        </div>

      </div>

      <div className="hidden md:flex xl:hidden w-full max-w-7xl mx-auto px-4 md:px-10 py-2">
        <Link href="/" className="flex-shrink-0 mr-6">
          <Image src="/images/still-unsung-logo.png" alt="StillUnsung.com" width={100} height={100} className="w-auto h-20" />
        </Link>
        <div className="flex flex-col justify-center gap-2 flex-1">
          <nav className="flex items-center gap-6">
            <NavLinks />
          </nav>
          <SearchInput />
        </div>
      </div>

      <div className="flex md:hidden items-center gap-3 h-16 px-4">
        <button
          className="flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span className="w-6 h-0.5 bg-gray-700 transition-transform" style={{ transform: mobileMenuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }} />
          <span className="w-6 h-0.5 bg-gray-700 transition-opacity" style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
          <span className="w-6 h-0.5 bg-gray-700 transition-transform" style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }} />
        </button>
        <Link href="/" className="flex-shrink-0">
          <Image src="/images/still-unsung-logo.png" alt="StillUnsung.com" width={80} height={80} className="w-auto h-10" />
        </Link>
        <SearchInput isMobile={true} />
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col py-2">
            <Link href="/event" className="px-4 py-3 hover:bg-gray-50 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Events</Link>
            <Link href="/song" className="px-4 py-3 hover:bg-gray-50 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Songs</Link>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Browse</div>
            <Link href="/band" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>Bands & Musicians</Link>
            <Link href="/venue" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>Venues</Link>
            <Link href="/album" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>Albums</Link>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Guides</div>
            <Link href="/guides/getting-started" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>Getting Started</Link>
            <Link href="/guides/deep-dives" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>Deep Dives</Link>
            <Link href="/guides/researchers" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>For Researchers</Link>
            <Link href="/blog" className="px-6 py-2 hover:bg-gray-50 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>Blog & Updates</Link>
            <div className="border-t border-gray-200 mt-2"></div>
            <Link href="/about" className="px-4 py-3 hover:bg-gray-50 text-gray-700" onClick={() => setMobileMenuOpen(false)}>About</Link>
            {isAdmin && <Link href="/admin" className="px-4 py-3 hover:bg-gray-50 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;