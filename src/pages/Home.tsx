import { Link } from "react-router";

export default function Home() {
  return (
    <main className="mx-auto flex min-w-0 w-full max-w-(--container-width) min-h-[calc(100svh-var(--header-height))] flex-col items-center justify-center gap-(--space-6) px-(--space-6) text-center">
      <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-extrabold">AGNHUB</h1>
      <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-(--color-text-secondary)">
        Home Page — choose where to go.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-(--space-3)">
        <Link
          to="/book"
          className="flex h-11 items-center rounded-(--radius-full) bg-(--color-primary) px-(--space-6) text-sm font-semibold text-(--color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85"
        >
          Open Booking
        </Link>
        <Link
          to="/dashboard"
          className="flex h-11 items-center rounded-(--radius-full) border border-(--color-border) px-(--space-6) text-sm font-semibold text-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
