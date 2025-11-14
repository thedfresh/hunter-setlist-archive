"use client";
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

interface SiteNavProps {
    isAdmin: boolean;
    onLinkClick?: () => void; // For mobile menu to close
}

export default function SiteNav({ isAdmin, onLinkClick }: SiteNavProps) {
    const [browseMenuOpen, setBrowseMenuOpen] = useState(false);
    const [guidesMenuOpen, setGuidesMenuOpen] = useState(false);
    const browseRef = useRef<HTMLDivElement>(null);
    const guidesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
                setBrowseMenuOpen(false);
            }
            if (guidesRef.current && !guidesRef.current.contains(event.target as Node)) {
                setGuidesMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClick = () => {
        setBrowseMenuOpen(false);
        setGuidesMenuOpen(false);
        onLinkClick?.();
    };

    return (
        <nav className="flex items-center gap-6 flex-shrink-0">
            <Link href="/event" className="nav-link" onClick={handleClick}>
                Events
            </Link>
            <Link href="/song" className="nav-link" onClick={handleClick}>
                Songs
            </Link>

            <div className="relative" ref={browseRef}>
                <button
                    className="nav-dropdown-button"
                    onClick={() => {
                        setBrowseMenuOpen(!browseMenuOpen);
                        setGuidesMenuOpen(false);
                    }}
                >
                    Browse
                    <svg className="nav-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {browseMenuOpen && (
                    <div className="nav-dropdown">
                        <Link href="/band" className="nav-dropdown-item" onClick={handleClick}>
                            Bands & Musicians
                        </Link>
                        <Link href="/venue" className="nav-dropdown-item" onClick={handleClick}>
                            Venues
                        </Link>
                        <Link href="/album" className="nav-dropdown-item" onClick={handleClick}>
                            Albums
                        </Link>
                    </div>
                )}
            </div>

            <div className="relative" ref={guidesRef}>
                <button
                    className="nav-dropdown-button"
                    onClick={() => {
                        setGuidesMenuOpen(!guidesMenuOpen);
                        setBrowseMenuOpen(false);
                    }}
                >
                    Guides
                    <svg className="nav-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {guidesMenuOpen && (
                    <div className="nav-dropdown">
                        <Link href="/guides/getting-started" className="nav-dropdown-item" onClick={handleClick}>
                            Getting Started
                        </Link>
                        <Link href="/guides/deep-dives" className="nav-dropdown-item" onClick={handleClick}>
                            Deep Dives
                        </Link>
                        <Link href="/guides/researchers" className="nav-dropdown-item" onClick={handleClick}>
                            For Researchers
                        </Link>
                        <Link href="/blog" className="nav-dropdown-item" onClick={handleClick}>
                            Blog & Updates
                        </Link>
                    </div>
                )}
            </div>

            <Link href="/about" className="nav-link" onClick={handleClick}>
                About
            </Link>

            {isAdmin && (
                <>
                    <span className="text-gray-300 mx-2">|</span>
                    <Link href="/admin" className="nav-link" onClick={handleClick}>
                        Admin
                    </Link>
                </>
            )}
        </nav>
    );
}