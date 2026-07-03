"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  placeholder = "Search products, categories, brands...",
  className,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSearch?.(query.trim());
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-4 transition-colors duration-[250ms] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className
      )}
    >
      <Search className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-full w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-placeholder"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
