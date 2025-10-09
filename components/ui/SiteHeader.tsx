
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      fetch(`/api/events/search-suggestions?q=${encodeURIComponent(query)}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => {
          //console.log('Suggestions received:', data);
          setSuggestions(data.suggestions || [])
        })
        .catch(() => setSuggestions([]));
    }, 100);
    return () => clearTimeout(handler);
  }, [query]);

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSuggestionClick = (s: any) => {
    setShowDropdown(false);
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
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        setShowDropdown(false);
        setQuery("");

        const params = new URLSearchParams();
        params.set('search', selected.value);
        params.set('searchType', selected.type);

        if (selected.type === 'person-band') {
          if (selected.bandId) params.set('bandId', selected.bandId.toString());
          if (selected.musicianId) params.set('musicianId', selected.musicianId.toString());
        } else if (selected.type === 'person-all') {
          if (selected.bandIds) params.set('bandIds', selected.bandIds.join(','));
          if (selected.musicianIds) params.set('musicianIds', selected.musicianIds.join(','));
        } else if (selected.type === 'person-guest') {
          if (selected.musicianIds) params.set('musicianIds', selected.musicianIds.join(','));
        }

        router.push(`/event?${params.toString()}`);
      } else if (selectedIndex === -1 && suggestions.length > 0) {
        e.preventDefault();
        const firstSuggestion = suggestions[0];
        setShowDropdown(false);
        setQuery("");

        const params = new URLSearchParams();
        params.set('search', firstSuggestion.value);
        params.set('searchType', firstSuggestion.type);

        if (firstSuggestion.type === 'person-band') {
          if (firstSuggestion.bandId) params.set('bandId', firstSuggestion.bandId.toString());
          if (firstSuggestion.musicianId) params.set('musicianId', firstSuggestion.musicianId.toString());
        } else if (firstSuggestion.type === 'person-all') {
          if (firstSuggestion.bandIds) params.set('bandIds', firstSuggestion.bandIds.join(','));
          if (firstSuggestion.musicianIds) params.set('musicianIds', firstSuggestion.musicianIds.join(','));
        } else if (firstSuggestion.type === 'person-guest') {
          if (firstSuggestion.musicianIds) params.set('musicianIds', firstSuggestion.musicianIds.join(','));
        }

        router.push(`/event?${params.toString()}`);
      }
    }
  };


  return (
    <header className="site-header relative">
      <div className="logo-container">
        <Link href="/">
          <Image
            src="/images/title.png"
            alt="Robert Hunter Performance Archive"
            width={200}
            height={184}
            className="site-logo"
          />
        </Link>
      </div>
      <div className="nav-bar">
        <div className="nav-bar-content">
          <nav className="main-nav">
            <Link href="/event" className="nav-link">Shows</Link>
            <Link href="/song" className="nav-link">Songs</Link>
            <Link href="/venue" className="nav-link">Venues</Link>
            <Link href="/band" className="nav-link">Bands</Link>
            <Link href="/hunter" className="nav-link">Hunter</Link>
            <Link href="/about" className="nav-link">About</Link>
          </nav>
          <div className="relative w-full max-w-xs">
            <input
              ref={inputRef}
              type="text"
              className="header-search-box px-3 py-2 pl-10 rounded w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search dates, places or names..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length >= 2) {
                  setShowDropdown(true);
                }
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {showDropdown && Array.isArray(suggestions) && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50"
                style={{ maxHeight: "260px", overflowY: "auto" }}
              >
                {suggestions.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 cursor-pointer text-sm text-gray-800 ${idx === selectedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    <span className="font-medium">{s.label}</span>
                    {/* {s.type && (
                      <span className="ml-2 text-xs text-gray-500">[{s.label}]</span>
                    )} */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
