'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, X, PhoneCall } from 'lucide-react';
import { SECTIONS } from '@/lib/data/editorial-data';
import { MastheadWordmark } from '../brand/BrandLogo';

export function EditorialHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY > 180;
      setIsSticky((prev) => (prev !== scrolled ? scrolled : prev));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/directory?q=${encodeURIComponent(trimmed)}`);
  }

  const [formattedDate, setFormattedDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  );
  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    );
  }, []);

  return (
    <>
      <header className="w-full bg-[#FAFAF7] text-[#111111] border-b border-[#E5E5E0]">
        {/* Clean Single-Row Top Bar (Simple on Mobile, Single Utility Row on Desktop) */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-10 border-b border-[#E5E5E0] flex items-center justify-between text-xs font-sans text-neutral-600">
          {/* Left: Mobile Menu Button OR Desktop Date */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle sections menu"
              className="lg:hidden inline-flex items-center gap-1.5 text-[#111111] hover:text-[#1E48B8] font-semibold py-1 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>Sections</span>
            </button>
            <time
              dateTime="2026-10-28"
              className="hidden lg:inline font-medium text-[#111111]"
            >
              {formattedDate}
            </time>
          </div>

          {/* Right: Search & 988 Crisis Line */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              aria-label="Search articles and clinical index"
              className="inline-flex items-center gap-1.5 text-[#111111] hover:text-[#1E48B8] font-medium py-1 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-[#1E48B8]" aria-hidden="true" />
              <span>Search</span>
            </button>
            <span aria-hidden="true" className="text-[#E5E5E0]">
              |
            </span>
            <Link
              href="/editorial-policy"
              className="hidden sm:inline hover:text-[#1F44A8] transition-colors whitespace-nowrap"
            >
              Editorial Policy
            </Link>
            <span aria-hidden="true" className="hidden sm:inline text-[#E5E5E0]">
              |
            </span>
            <Link
              href="/crisis-resources"
              className="inline-flex items-center gap-1 font-semibold text-[#1F44A8] hover:underline whitespace-nowrap"
            >
              <PhoneCall className="w-3 h-3" aria-hidden="true" />
              <span>988 Crisis Line</span>
            </Link>
          </div>
        </div>

        {/* Collapsible Search Drawer */}
        {searchOpen && (
          <div className="bg-[#EEF2FB] border-b border-[#1E48B8]/25 py-3 px-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <label htmlFor="masthead-search-input" className="sr-only">
                Search articles, conditions, treatments, and glossary
              </label>
              <input
                id="masthead-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, conditions, treatments, or glossary terms..."
                className="flex-1 bg-white border border-[#E5E5E0] px-3.5 py-2 text-sm font-sans text-[#111111] focus:outline-none focus:border-[#1E48B8]"
              />
              <button
                type="submit"
                className="bg-[#1E48B8] text-white px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#1E3A8A] transition-colors whitespace-nowrap cursor-pointer"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="p-2 text-neutral-600 hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Centered NYT-Style Masthead with Logo & Plain Text Tagline */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 text-center">
          <Link
            href="/"
            aria-label="Therapist Psychologist Today â€” Home"
            className="inline-block group focus:outline-none"
          >
            <MastheadWordmark variant="blue-on-light" />
          </Link>
          <p className="mt-1 text-xs sm:text-[13px] font-sans font-medium tracking-wide text-neutral-700">
            <strong className="font-semibold text-[#111111]">
              Therapist Psychologist Today
            </strong>{' '}
            <span aria-hidden="true" className="mx-1.5 text-neutral-400">
              â€”
            </span>{' '}
            Independent Journalism on Psychiatry, Behavioral Science &amp; Clinical Medicine
          </p>
          <p className="lg:hidden mt-1 text-[11px] font-sans text-neutral-500">
            {formattedDate}
          </p>
        </div>

        {/* Desktop Section Navigation Bar (Single Clean Row Between Thin Rules) */}
        <nav
          aria-label="Primary Editorial Sections"
          className="hidden lg:block max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5E5E0] border-b-2 border-[#111111]"
        >
          <ul className="flex items-center justify-center gap-6 xl:gap-8 py-2.5 text-[11px] font-sans font-bold uppercase tracking-wider">
            {SECTIONS.map((sec) => {
              const href = `/section/${sec.slug}`;
              const isActive =
                pathname === href || (sec.slug === 'latest-news' && pathname === '/');
              return (
                <li key={sec.slug} className="shrink-0">
                  <Link
                    href={href}
                    className={`pb-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#1E48B8] border-b-2 border-[#1E48B8]'
                        : 'text-[#111111] hover:text-[#1E48B8]'
                    }`}
                  >
                    {sec.name}
                  </Link>
                </li>
              );
            })}
            <li aria-hidden="true" className="text-[#E5E5E0]">
              |
            </li>
            <li className="shrink-0">
              <Link
                href="/directory"
                className={`pb-2 transition-colors whitespace-nowrap ${
                  pathname?.startsWith('/directory') ||
                  pathname?.startsWith('/conditions') ||
                  pathname?.startsWith('/treatments') ||
                  pathname?.startsWith('/glossary')
                    ? 'text-[#1E48B8] border-b-2 border-[#1E48B8]'
                    : 'text-[#1F44A8] hover:text-[#111111]'
                }`}
              >
                Directory
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Collapsible Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Sections Navigation"
            className="lg:hidden bg-white border-t border-[#E5E5E0] border-b-2 border-[#111111] px-4 py-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map((sec) => (
                <Link
                  key={sec.slug}
                  href={`/section/${sec.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider text-[#111111] hover:bg-[#EEF2FB] hover:text-[#1E48B8] border border-[#E5E5E0]"
                >
                  {sec.name}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-[#E5E5E0] flex flex-wrap gap-3 text-xs font-sans font-semibold text-[#1F44A8]">
              <Link href="/directory" onClick={() => setMobileMenuOpen(false)}>
                Clinical Directory
              </Link>
              <span>Â·</span>
              <Link href="/editorial-policy" onClick={() => setMobileMenuOpen(false)}>
                Editorial Policy
              </Link>
              <span>Â·</span>
              <Link href="/crisis-resources" onClick={() => setMobileMenuOpen(false)}>
                988 Crisis Resources
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Compact Sticky Header on Scroll */}
      {isSticky && (
        <div
          role="region"
          aria-label="Sticky quick navigation"
          className="fixed top-0 left-0 right-0 z-40 bg-[#FAFAF7]/95 backdrop-blur-sm border-b border-[#E5E5E0] shadow-xs transition-transform duration-150"
        >
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0">
              <MastheadWordmark variant="blue-on-light" compact />
            </Link>

            <nav
              aria-label="Compact sticky section links"
              className="hidden xl:flex items-center gap-5 text-[11px] font-sans font-bold uppercase tracking-wider"
            >
              {SECTIONS.slice(0, 6).map((sec) => {
                const href = `/section/${sec.slug}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={sec.slug}
                    href={href}
                    className={`py-1 whitespace-nowrap ${
                      isActive
                        ? 'text-[#1E48B8] border-b-2 border-[#1E48B8]'
                        : 'text-[#111111] hover:text-[#1E48B8]'
                    }`}
                  >
                    {sec.shortName}
                  </Link>
                );
              })}
              <Link
                href="/directory"
                className="py-1 text-[#1F44A8] hover:underline whitespace-nowrap"
              >
                Directory
              </Link>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/directory"
                className="px-3 py-1.5 bg-[#1E48B8] text-white text-[11px] font-sans font-bold uppercase tracking-wider hover:bg-[#1E3A8A] transition-colors whitespace-nowrap"
              >
                Directory
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

