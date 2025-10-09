
"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SiteHeader = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSuggestionClick = (s: any) => {
    setShowDropdown(false);
    setQuery("");
    router.push(`/event?search=${encodeURIComponent(s.value)}&searchType=${encodeURIComponent(s.type)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.length > 0) {
      setShowDropdown(false);
      router.push(`/event?q=${encodeURIComponent(query)}`);
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
              className="header-search-box px-3 py-2 rounded w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search shows, songs, venues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
            {showDropdown && Array.isArray(suggestions) && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50"
                style={{ maxHeight: "260px", overflowY: "auto" }}
              >
                {suggestions.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-800"
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    <span className="font-medium">{s.value}</span>
                    {s.type && (
                      <span className="ml-2 text-xs text-gray-500">[{s.type}]</span>
                    )}
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
