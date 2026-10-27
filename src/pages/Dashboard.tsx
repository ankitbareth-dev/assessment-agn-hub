import { useState } from "react";
import { Link } from "react-router";
import { formatDuration, formatPrice } from "../utlis/services";
import {
  appStorage,
  type BookingRecord,
  type BookingStatus,
} from "../utlis/storage";

const STATUS_TABS = ["Upcoming", "Completed", "Cancelled"] as const;

type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_KEY: Record<StatusTab, BookingStatus> = {
  Upcoming: "upcoming",
  Completed: "completed",
  Cancelled: "cancelled",
};

const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string; dotClassName: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "border-(--color-border-hover) text-(--color-text)",
    dotClassName: "bg-(--color-text)",
  },
  completed: {
    label: "Completed",
    className: "border-(--color-border) text-(--color-text-secondary)",
    dotClassName: "bg-(--color-text-secondary)",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-(--color-border) text-(--color-text-muted)",
    dotClassName: "bg-(--color-text-muted)",
  },
};

function bookingTime(record: BookingRecord) {
  const date = new Date(record.date);
  const [hours, minutes] = record.slot.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

const formatDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatSlotRange = (slot: string, durationMinutes: number) => {
  const [hours, minutes] = slot.split(":").map(Number);

  const format = (total: number) => {
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const period = h >= 12 ? "PM" : "AM";
    const display = h % 12 === 0 ? 12 : h % 12;

    return `${display}:${String(m).padStart(2, "0")} ${period}`;
  };

  const start = hours * 60 + minutes;
  return `${format(start)} – ${format(start + durationMinutes)}`;
};

function inDaysLabel(iso: string) {
  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const diff = Math.round(
    (startOfDay(new Date(iso)) - startOfDay(new Date())) / 86400000,
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1) return `In ${diff} days`;
  if (diff === -1) return "Yesterday";

  return `${Math.abs(diff)} days ago`;
}

function CalendarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function EmptyCalendarIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M9 15h6" />
    </svg>
  );
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<BookingRecord[]>(() =>
    appStorage.getBookings(),
  );
  const [activeTab, setActiveTab] = useState<StatusTab>("Upcoming");

  const counts: Record<StatusTab, number> = {
    Upcoming: bookings.filter((booking) => booking.status === "upcoming")
      .length,
    Completed: bookings.filter((booking) => booking.status === "completed")
      .length,
    Cancelled: bookings.filter((booking) => booking.status === "cancelled")
      .length,
  };

  const visible = bookings
    .filter((booking) => booking.status === STATUS_KEY[activeTab])
    .sort((a, b) =>
      activeTab === "Upcoming"
        ? bookingTime(a) - bookingTime(b)
        : bookingTime(b) - bookingTime(a),
    );

  const handleCancel = (id: string) => {
    appStorage.updateBookingStatus(id, "cancelled");
    setBookings(appStorage.getBookings());
  };

  return (
    <main className="mx-auto w-full max-w-(--container-width) px-4 py-8 sm:px-(--space-6) sm:py-10">
      {/* Page heading */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-text-muted)">
            Your schedule
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-(--color-text) sm:text-4xl">
            Appointments
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-(--color-text-secondary)">
            Manage your upcoming sessions and keep track of your appointment
            history.
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-(--color-primary) px-5 py-3 text-sm font-semibold text-(--color-primary-text) transition-opacity hover:opacity-85"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          Book an appointment
        </Link>
      </header>

      {/* Summary cards */}
      {/* <section
        aria-label="Appointment summary"
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-(--color-text-secondary)">Upcoming</p>
            <span className="text-(--color-text-secondary)">
              <CalendarIcon />
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tabular-nums text-(--color-text)">
            {counts.Upcoming}
          </p>

          <p className="mt-1 text-xs text-(--color-text-muted)">
            Scheduled sessions
          </p>
        </div>

        <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-(--color-text-secondary)">Completed</p>
            <span className="text-(--color-text-secondary)">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
              </svg>
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tabular-nums text-(--color-text)">
            {counts.Completed}
          </p>

          <p className="mt-1 text-xs text-(--color-text-muted)">
            Finished sessions
          </p>
        </div>

        <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-(--color-text-secondary)">Cancelled</p>
            <span className="text-(--color-text-secondary)">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tabular-nums text-(--color-text)">
            {counts.Cancelled}
          </p>

          <p className="mt-1 text-xs text-(--color-text-muted)">
            Cancelled sessions
          </p>
        </div>
      </section> */}

      {/* Appointment list */}
      <section className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* <div>
            <h2 className="text-xl font-bold text-(--color-text)">
              Your bookings
            </h2>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              Browse and manage your appointments.
            </p>
          </div> */}

          <p className="text-xs text-(--color-text-muted)">
            {visible.length}{" "}
            {visible.length === 1 ? "appointment" : "appointments"}
          </p>
        </div>

        {/* Status filters */}
        <div
          role="group"
          aria-label="Filter appointments by status"
          className="mt-5 flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface) p-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {STATUS_TABS.map((label) => {
            const isActive = activeTab === label;

            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(label)}
                aria-pressed={isActive}
                className={[
                  "flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-(--color-primary) text-(--color-primary-text)"
                    : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
                ].join(" ")}
              >
                {label}

                <span
                  className={[
                    "min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums",
                    isActive
                      ? "bg-(--color-primary-text)/10"
                      : "bg-(--color-surface-hover)",
                  ].join(" ")}
                >
                  {counts[label]}
                </span>
              </button>
            );
          })}
        </div>

        {visible.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {visible.map((appt) => {
              const status = STATUS_STYLES[appt.status];

              return (
                <article
                  key={appt.id}
                  className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-border-hover) sm:p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Appointment information */}
                    <div className="flex min-w-0 gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface-hover) text-(--color-text-secondary)">
                        <CalendarIcon />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="wrap-break-word text-base font-semibold text-(--color-text)">
                            {appt.serviceName}
                          </h3>

                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                              status.className,
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "size-1.5 rounded-full",
                                status.dotClassName,
                              ].join(" ")}
                            />
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                          {formatDateLabel(appt.date)}
                        </p>

                        <p className="mt-1 text-sm text-(--color-text-secondary)">
                          {formatSlotRange(appt.slot, appt.serviceDuration)}
                          <span className="mx-2 text-(--color-text-muted)">
                            ·
                          </span>
                          {formatDuration(appt.serviceDuration)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-muted)">
                          <span>{appt.name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{appt.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and actions */}
                    <div className="flex items-center justify-between gap-4 border-t border-(--color-border) pt-4 sm:min-w-36 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-xs text-(--color-text-muted)">
                          {appt.status === "upcoming"
                            ? inDaysLabel(appt.date)
                            : "Appointment total"}
                        </p>

                        <p className="mt-1 text-xl font-bold tabular-nums text-(--color-text)">
                          {formatPrice(appt.servicePrice)}
                        </p>
                      </div>

                      {appt.status === "upcoming" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(appt.id)}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-border-hover) hover:bg-(--color-surface-hover) hover:text-(--color-text)"
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="mt-4 rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) px-5 py-12 text-center sm:px-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-hover) text-(--color-text-secondary)">
              <EmptyCalendarIcon />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-(--color-text)">
              {activeTab === "Upcoming"
                ? "Nothing scheduled yet"
                : `No ${activeTab.toLowerCase()} appointments`}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--color-text-secondary)">
              {activeTab === "Upcoming"
                ? "Ready to get started? Book an appointment and your upcoming sessions will appear here."
                : `Your ${activeTab.toLowerCase()} appointments will appear here when you have them.`}
            </p>

            {activeTab === "Upcoming" && (
              <Link
                to="/book"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-(--color-primary) px-5 py-3 text-sm font-semibold text-(--color-primary-text) transition-opacity hover:opacity-85"
              >
                Explore services
              </Link>
            )}

            {activeTab !== "Upcoming" && (
              <button
                type="button"
                onClick={() => setActiveTab("Upcoming")}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-(--color-border) px-5 py-3 text-sm font-medium text-(--color-text) transition-colors hover:bg-(--color-surface-hover)"
              >
                View upcoming appointments
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
