import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { SERVICES } from "../data/services";
import { formatDuration, formatPrice } from "../utlis/services";

const STEPS = ["Date", "Time", "Your details", "Review"];

function getBookableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.getDay();
    if (day !== 0 && day !== 6) dates.push(date);
  }
  return dates;
}

const formatDateLabel = (date: Date, index: number) =>
  index === 0
    ? "Today"
    : date
        .toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
        .replace(",", ",");

export default function Booking() {
  const { serviceId } = useParams();
  const service = SERVICES.find((s) => s.id === Number(serviceId));

  const dates = useMemo(() => getBookableDates(), []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!service) {
    return (
      <main className="mx-auto w-full max-w-(--container-width) px-(--space-6) py-(--space-8)">
        <h1 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold">
          Service not found
        </h1>
        <p className="mt-(--space-2) text-(--color-color-text-secondary)">
          The service you're looking for doesn't exist.
        </p>
        <Link
          to="/book"
          className="mt-(--space-6) inline-flex rounded-lg border border-(--color-border) px-(--space-5) py-(--space-2) text-sm font-medium text-(--color-color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover)"
        >
          Back to services
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-(--container-width) px-(--space-6) py-(--space-8)">
      <section className="rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
        <div className="flex items-start justify-between gap-(--space-4)">
          <div className="flex items-center gap-(--space-4)">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-surface-hover)">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-(--color-color-text)"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-(--color-color-text) sm:text-xl">
                {service.name}
              </h1>
              <p className="mt-(--space-1) text-sm text-(--color-color-text-secondary)">
                {formatDuration(service.duration)} ·{" "}
                {formatPrice(service.price)}
              </p>
            </div>
          </div>

          <Link
            to="/book"
            className="shrink-0 rounded-lg border border-(--color-border) px-(--space-5) py-(--space-2) text-sm font-medium text-(--color-color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
          >
            Change
          </Link>
        </div>

        <div className="mt-(--space-6) border-t border-(--color-border)" />

        <ol className="mt-(--space-6) flex items-center">
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === 1;
            const isLast = index === STEPS.length - 1;
            return (
              <li
                key={label}
                className={
                  isLast ? "flex items-center" : "flex flex-1 items-center"
                }
              >
                <div className="flex items-center gap-(--space-2)">
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-(--color-primary) text-(--color-color-primary-text)!"
                        : "border border-(--color-border) text-(--color-color-text-secondary)",
                    ].join(" ")}
                  >
                    {stepNumber}
                  </span>
                  <span
                    className={[
                      "hidden text-sm sm:inline",
                      isActive
                        ? "font-semibold text-(--color-color-text)"
                        : "text-(--color-color-text-secondary)",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <span className="mx-(--space-3) h-px flex-1 bg-(--color-border)" />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
        <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
          <h2 className="text-base font-semibold text-(--color-color-text)">
            Choose a date
          </h2>
          <p className="text-xs text-(--color-color-text-muted)">
            Mon–Fri only · up to 60 days ahead
          </p>
        </div>

        <div className="mt-(--space-4) flex gap-(--space-2) overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {dates.map((date, index) => (
            <button
              key={date.toDateString()}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-pressed={selectedIndex === index}
              className={[
                "shrink-0 whitespace-nowrap rounded-full border px-(--space-4) py-(--space-2) text-sm font-medium [transition:var(--transition-fast)]",
                selectedIndex === index
                  ? "border-transparent bg-(--color-primary) text-(--color-color-primary-text)!"
                  : "border-(--color-border) bg-(--color-surface) text-(--color-color-text-secondary) hover:border-(--color-border-hover) hover:text-(--color-color-text)",
              ].join(" ")}
            >
              {formatDateLabel(date, index)}
            </button>
          ))}
        </div>

        <div className="mt-(--space-6) flex justify-end">
          <button
            type="button"
            disabled={selectedIndex === null}
            className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </section>
    </main>
  );
}
