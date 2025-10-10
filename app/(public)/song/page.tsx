"use client";

import Link from "next/link";
import React, { useState } from "react";
import { compareSongTitles } from '@/lib/songSort';
import { PageContainer } from '@/components/ui/PageContainer';

type PageSize = number | "All";


import { useEffect } from "react";

type Song = {
  id: number;
  title: string;
  slug: string;
  performanceCount: number;
  firstPerformance?: { date: string; slug: string; sortDate: string };
  lastPerformance?: { date: string; slug: string; sortDate: string };
};


type SortKey = "title" | "performanceCount" | "firstPerformance" | "lastPerformance";
type SortDirection = "asc" | "desc";

export default function SongBrowsePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(100);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [search, setSearch] = useState("");
  const pageSizes: PageSize[] = [25, 50, 100, 200, 250, "All"];
  const showAll = pageSize === "All";

  // Filter songs by search string
  const filteredSongs = search.trim() === ""
    ? songs
    : songs.filter(song => song.title.toLowerCase().includes(search.trim().toLowerCase()));
  const total = filteredSongs.length;

  // Sort songs before paging
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortKey === "title") {
      return sortDirection === "asc"
        ? compareSongTitles(a, b)
        : compareSongTitles(b, a);
    }
    let aVal: any = a[sortKey];
    let bVal: any = b[sortKey];
    // For dates, sort by sortDate value
    if (sortKey === "firstPerformance" || sortKey === "lastPerformance") {
      const aDate = aVal?.sortDate ? new Date(aVal.sortDate) : null;
      const bDate = bVal?.sortDate ? new Date(bVal.sortDate) : null;
      if (!aDate && !bDate) return 0;
      if (!aDate) return sortDirection === "asc" ? 1 : -1;
      if (!bDate) return sortDirection === "asc" ? -1 : 1;
      if (aDate.getTime() < bDate.getTime()) return sortDirection === "asc" ? -1 : 1;
      if (aDate.getTime() > bDate.getTime()) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // For numbers
    if (sortKey === "performanceCount") {
      aVal = aVal ?? 0;
      bVal = bVal ?? 0;
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    aVal = (aVal || "").toString().toLowerCase();
    bVal = (bVal || "").toString().toLowerCase();
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const pagedSongs = showAll
    ? sortedSongs
    : sortedSongs.slice((page - 1) * (pageSize as number), page * (pageSize as number));
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }
  const totalPages = showAll ? 1 : Math.ceil(total / (pageSize as number));
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/songs");
        if (!res.ok) throw new Error("Failed to fetch songs");
        const data = await res.json();
        setSongs(data.songs || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val: PageSize = e.target.value === "All" ? "All" : parseInt(e.target.value, 10);
    setPageSize(val);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto py-10 px-4">Loading songs…</div>;
  }
  if (error) {
    return <div className="max-w-4xl mx-auto py-10 px-4 text-red-600">Error: {error}</div>;
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-title">Songs Performed</div>
      </div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="page-subtitle">{total} songs found</div>
        <p className="note-text">Note: song counts are exclusive of duplicate performances in a single show (i.e. Dire Wolf medleys) as well as
          performances flagged as studios, rehearsals, or soundchecks.
        </p>
        <div className="search-bar w-full sm:w-96">
          <input
            className="search-input-large"
            placeholder="Search songs..."
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
        {/* <div className="filter-chips mb-2"> ...filters here... </div> */}
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <select
            className="select w-auto ml-2"
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Page size"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>{size === "All" ? "All" : size}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable cursor-pointer" onClick={() => handleSort("title")}>Song Title {sortKey === "title" && (sortDirection === "asc" ? "▲" : "▼")}</th>
              <th className="sortable cursor-pointer" onClick={() => handleSort("performanceCount")}>Times Played {sortKey === "performanceCount" && (sortDirection === "asc" ? "▲" : "▼")}</th>
              <th className="sortable cursor-pointer" onClick={() => handleSort("firstPerformance")}>First {sortKey === "firstPerformance" && (sortDirection === "asc" ? "▲" : "▼")}</th>
              <th className="sortable cursor-pointer" onClick={() => handleSort("lastPerformance")}>Last {sortKey === "lastPerformance" && (sortDirection === "asc" ? "▲" : "▼")}</th>
            </tr>
          </thead>
          <tbody>
            {pagedSongs.map((song) => {
              return (
                <tr key={song.id}>
                  <td>
                    <Link href={`/song/${song.slug}`} className="link-internal">
                      {song.title}
                    </Link>
                  </td>
                  <td>{song.performanceCount}</td>
                  <td>
                    {song.firstPerformance?.slug ? (
                      <a href={`/event/${song.firstPerformance.slug}`} className="link-internal">
                        {song.firstPerformance.date}
                      </a>
                    ) : (
                      <span>{song.firstPerformance?.date}</span>
                    )}
                  </td>
                  <td>
                    {song.lastPerformance?.slug ? (
                      <a href={`/event/${song.lastPerformance.slug}`} className="link-internal">
                        {song.lastPerformance.date}
                      </a>
                    ) : (
                      <span>{song.lastPerformance?.date}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination controls */}
      {!showAll && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-link"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            (p === page || p === 1 || p === totalPages || Math.abs(p - page) <= 1) ? (
              <button
                key={p}
                className={
                  "page-link" + (p === page ? " page-link-active" : "")
                }
                onClick={() => handlePageChange(p)}
                disabled={p === page}
              >
                {p}
              </button>
            ) :
              (p === page - 2 || p === page + 2) ? (
                <span key={p} className="page-ellipsis">...</span>
              ) : null
          )}
          <button
            className="page-link"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            {'>'}
          </button>
        </div>
      )}
    </PageContainer>
  );
}
