import { useMemo, useState } from "react";
import { SERVICES, SERVICE_CATEGORIES } from "../data/services";
import type { ServiceCategory } from "../types/services";
import { Link } from "react-router";

type CategoryFilter = "All" | ServiceCategory;

const FILTERS: CategoryFilter[] = ["All", ...SERVICE_CATEGORIES];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function Book() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter((service) => {
      const matchesCategory =
        category === "All" || service.category === category;
      const matchesQuery =
        q === "" ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-(--container-width) px-(--space-6) py-(--space-8)">
      <h1 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold">
        Book a consultation
      </h1>
      <p className="mt-(--space-2) text-(--color-color-text-secondary)">
        Choose a service, then pick a date and time that suit you.
      </p>

      <div className="relative mt-(--space-6)">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search services…"
          aria-label="Search services"
          className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) py-3 pl-11 pr-4 text-sm text-(--color-text) outline-none [transition:var(--transition-fast)] placeholder:text-(--color-text-muted) focus:border-(--color-border-hover) "
        />
      </div>

      <div className="mt-(--space-4) flex w-full min-w-0 items-center gap-(--space-2) overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setCategory(filter)}
            aria-pressed={category === filter}
            className={[
              "flex shrink-0 items-center whitespace-nowrap rounded-full px-(--space-4) py-(--space-2) text-sm font-medium [transition:var(--transition-fast)]",
              category === filter
                ? "bg-(--color-primary) text-(--color-primary-text)"
                : "border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-border-hover) hover:text-(--color-text)",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>

      <p className="mt-(--space-4) text-xs text-(--color-color-text-muted)">
        Showing {filtered.length} of {SERVICES.length} services
      </p>

      {filtered.length > 0 ? (
        <div className="mt-(--space-4) grid gap-(--space-4) sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Link
              key={service.id}
              to={`/book/${service.id}`}
              aria-label={`Book ${service.name}`}
              className="flex flex-col rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6) [transition:var(--transition-fast)] hover:border-(--color-border-hover)"
            >
              <span className="w-fit rounded-full bg-(--color-surface-hover) px-(--space-3) py-(--space-1) text-xs font-medium text-(--color-color-text-secondary)">
                {service.category}
              </span>
              <h2 className="mt-(--space-3) text-base font-semibold text-(--color-color-text)">
                {service.name}
              </h2>
              <p className="mb-(--space-4) mt-(--space-2) text-sm text-(--color-color-text-secondary)">
                {service.description}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-(--color-border) pt-(--space-4)">
                <span className="text-sm text-(--color-color-text-secondary)">
                  {service.duration} min
                </span>
                <span className="text-base font-bold text-(--color-color-text)">
                  {formatPrice(service.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-(--space-6) rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) p-(--space-8) text-center">
          <p className="text-sm font-medium text-(--color-color-text)">
            No services found
          </p>
          <p className="mt-(--space-2) text-sm text-(--color-color-text-secondary)">
            Try a different keyword or category.
          </p>
        </div>
      )}
    </main>
  );
}
