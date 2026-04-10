'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookOpen, Search, X } from 'lucide-react'
import { ROLES, getTotalTopics } from '@/lib/roles'
import { cn } from '@/lib/utils'

const CATEGORIES = [...new Set(ROLES.map((r) => r.category))]

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROLES.filter((r) => {
      const matchesCategory = !selectedCategory || r.category === selectedCategory
      const matchesSearch   = !q
        || r.title.toLowerCase().includes(q)
        || r.category.toLowerCase().includes(q)
        || r.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, query])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 md:px-8">

      {/* Header */}
      <div className="mb-8 border-b border-border pb-6 md:mb-10 md:pb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Role Catalogue
        </p>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          All in-demand roles. One platform.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Every curriculum is structured into modules, topics, and a final certification exam.
          Pick your role, complete Module 1 free, and enrol for the full course when you&apos;re ready.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search roles, e.g. cashier, hospitality…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
            !selectedCategory
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-foreground/20 text-foreground/70 hover:border-foreground/30 hover:text-foreground',
          )}
        >
          All categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              selectedCategory === cat
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-foreground/20 text-foreground/70 hover:border-foreground/30 hover:text-foreground',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(query || selectedCategory) && (
        <p className="mb-4 text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'role' : 'roles'} found
          {selectedCategory && <> in <span className="font-medium text-foreground">{selectedCategory}</span></>}
          {query && <> matching &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;</>}
        </p>
      )}

      {/* Role grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((role) => (
            <Link
              key={role.slug}
              href={`/explore/${role.slug}`}
              className="group flex flex-col rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <span className="text-2xl leading-none">{role.icon}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground/70">
                  {role.category}
                </span>
              </div>
              <h2 className="mb-1.5 text-[15px] font-semibold text-foreground transition-colors group-hover:text-primary">
                {role.title}
              </h2>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {role.description}
              </p>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <BookOpen className="size-3 shrink-0" />
                  {role.modules.length} modules · {getTotalTopics(role)} topics
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{role.price}</span>
                  <span className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                    Enroll
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No roles found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term or category.</p>
          <button
            onClick={() => { setQuery(''); setSelectedCategory(null) }}
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

    </div>
  )
}
