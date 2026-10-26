import { Link } from "react-router";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-background)">
      <nav
        aria-label="Main"
        className="mx-auto flex h-(--header-height) w-full max-w-(--container-width) items-center justify-between px-(--space-6)"
      >
        <Link
          to="/"
          className="[font-family:var(--font-heading)] text-xl font-extrabold tracking-[-0.03em] text-(--color-text) [transition:var(--transition-fast)] hover:opacity-70"
        >
          AGNHUB
        </Link>

        <div className="flex items-center gap-(--space-1)">
          <Link
            to="/book"
            className="flex items-center rounded-(--radius-full) px-(--space-4) py-(--space-2) text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:bg-(--color-surface-hover)"
          >
            Book
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center rounded-(--radius-full) px-(--space-4) py-(--space-2) text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:bg-(--color-surface-hover)"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
