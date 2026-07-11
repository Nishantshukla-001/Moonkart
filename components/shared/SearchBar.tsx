"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Search, X } from "lucide-react";

import { AspectImage } from "@/components/shared/AspectImage";
import { cn } from "@/lib/utils";
import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
} from "@/lib/recentSearchesStorage";
import { debounce } from "@/utils/debounce";
import { formatCurrency } from "@/utils/formatCurrency";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  salePrice: number | null;
}

const MIN_SUGGESTION_LENGTH = 2;

export function SearchBar({
  placeholder = "Search products, categories, brands...",
  className,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const listboxId = `search-suggestions-${useId()}`;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const latestRequestId = useRef(0);

  const showSuggestions = query.trim().length >= MIN_SUGGESTION_LENGTH;
  const listLength = showSuggestions ? suggestions.length : recentSearches.length;

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (term: string) => {
        const requestId = ++latestRequestId.current;
        setIsLoading(true);
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(term)}&pageSize=5`);
          const json = await response.json();
          if (requestId !== latestRequestId.current) return;
          setSuggestions(json.success ? json.data.items : []);
        } catch {
          if (requestId === latestRequestId.current) setSuggestions([]);
        } finally {
          if (requestId === latestRequestId.current) setIsLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    setHighlightedIndex(-1);
    if (!showSuggestions) {
      setSuggestions([]);
      return;
    }
    fetchSuggestions(query.trim());
  }, [query, showSuggestions, fetchSuggestions]);

  function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    setRecentSearches(readRecentSearches());
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSearch?.(trimmed);
  }

  function goToSuggestion(suggestion: ProductSuggestion) {
    addRecentSearch(query.trim());
    setRecentSearches(readRecentSearches());
    setIsOpen(false);
    setHighlightedIndex(-1);
    router.push(`/products/${suggestion.slug}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    runSearch(query);
  }

  function handleRecentClick(term: string) {
    setQuery(term);
    runSearch(term);
  }

  function handleRemoveRecent(event: React.MouseEvent, term: string) {
    event.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(readRecentSearches());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || listLength === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % listLength);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      if (showSuggestions) {
        const suggestion = suggestions[highlightedIndex];
        if (suggestion) goToSuggestion(suggestion);
      } else {
        const term = recentSearches[highlightedIndex];
        if (term) handleRecentClick(term);
      }
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form role="search" onSubmit={handleSubmit} className="flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-4 transition-colors duration-[250ms] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <Search className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          className="h-full w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-placeholder"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            aria-label="Clear search"
            className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-96 overflow-y-auto rounded-lg border border-border-light bg-background shadow-soft-lg"
        >
          {showSuggestions ? (
            isLoading ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-text-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Searching...
              </div>
            ) : suggestions.length === 0 ? (
              <p className="p-6 text-center text-sm text-text-muted">
                No products found for &quot;{query.trim()}&quot;.
              </p>
            ) : (
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={suggestion.id} role="option" aria-selected={index === highlightedIndex}>
                    <Link
                      href={`/products/${suggestion.slug}`}
                      onClick={() => goToSuggestion(suggestion)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 transition-colors",
                        index === highlightedIndex ? "bg-blush-light/60" : "hover:bg-bg-section/60"
                      )}
                    >
                      <div className="size-10 shrink-0">
                        <AspectImage src={suggestion.thumbnail} alt="" ratio="square" rounded="rounded-md" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-text-primary">{suggestion.name}</p>
                        <p className="text-xs text-text-muted">
                          {formatCurrency(suggestion.salePrice ?? suggestion.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
                <li className="border-t border-divider">
                  <button
                    type="button"
                    onClick={() => runSearch(query)}
                    className="w-full px-3.5 py-2.5 text-left text-sm font-semibold text-blush-hover hover:text-text-primary"
                  >
                    See all results for &quot;{query.trim()}&quot;
                  </button>
                </li>
              </ul>
            )
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-3.5 py-2">
                <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Recent Searches</p>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-xs font-medium text-blush-hover hover:text-text-primary"
                >
                  Clear all
                </button>
              </div>
              <ul>
                {recentSearches.map((term, index) => (
                  <li
                    key={term}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className={cn(
                      "flex items-center gap-2.5 px-3.5 py-1 transition-colors",
                      index === highlightedIndex ? "bg-blush-light/60" : "hover:bg-bg-section/60"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleRecentClick(term)}
                      className="flex flex-1 items-center gap-2.5 py-1.5 text-left text-sm text-text-primary"
                    >
                      <Clock className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                      <span className="line-clamp-1">{term}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove "${term}" from recent searches`}
                      onClick={(event) => handleRemoveRecent(event, term)}
                      className="shrink-0 rounded p-0.5 text-text-muted hover:text-danger"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
