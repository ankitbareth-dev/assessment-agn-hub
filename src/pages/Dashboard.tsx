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
  { label: string; className: string }
> = {
  upcoming: { label: "Upcoming", className: "text-(--color-color-success)" },
  completed: {
    label: "Completed",
    className: "text-(--color-color-text-secondary)",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-(--color-color-text-muted)",
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
  });

const formatSlotRange = (slot: string, durationMinutes: number) => {
  const [hours, minutes] = slot.split(":").map(Number);
  const format = (total: number) => {
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const period = h >= 12 ? "pm" : "am";
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}:${String(m).padStart(2, "0")} ${period}`;
  };
  const start = hours * 60 + minutes;
  return `${format(start)} – ${format(start + durationMinutes)}`;
};

function inDaysLabel(iso: string) {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round(
    (startOfDay(new Date(iso)) - startOfDay(new Date())) / 86400000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1) return `In ${diff} days`;
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<BookingRecord[]>(() =>
    appStorage.getBookings(),
  );
  const [activeTab, setActiveTab] = useState<StatusTab>("Upcoming");

  const tabs = STATUS_TABS.map((label) => ({
    label,
    count: bookings.filter((b) => b.status === STATUS_KEY[label]).length,
  }));

  const visible = bookings
    .filter((b) => b.status === STATUS_KEY[activeTab])
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
    <main className="mx-auto w-full max-w-(--container-width) px-(--space-6) py-(--space-8)">
      <h1 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold">
        Appointments
      </h1>
      <p className="mt-(--space-2) text-(--color-color-text-secondary)">
        Track upcoming sessions and review past ones.
      </p>

      <div className="mt-(--space-6) flex w-full items-center gap-(--space-1) overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-1) scrollbar-none [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActiveTab(tab.label)}
            aria-pressed={activeTab === tab.label}
            className={[
              "flex shrink-0 items-center gap-(--space-2) whitespace-nowrap rounded-md px-(--space-4) py-(--space-2) text-sm font-medium [transition:var(--transition-fast)]",
              activeTab === tab.label
                ? "bg-(--color-primary) text-(--color-color-primary-text)!"
                : "text-(--color-color-text-secondary) hover:text-(--color-color-text)",
            ].join(" ")}
          >
            {tab.label}
            <span className="opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="mt-(--space-6) flex flex-col gap-(--space-4)">
          {visible.map((appt) => {
            const status = STATUS_STYLES[appt.status];
            return (
              <article
                key={appt.id}
                className="flex flex-col gap-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6) [transition:var(--transition-fast)] hover:border-(--color-border-hover) sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-(--space-2)">
                  <h2 className="text-base font-semibold text-(--color-color-text)">
                    {appt.serviceName}
                  </h2>
                  <p className="text-sm text-(--color-color-text-secondary)">
                    {formatDateLabel(appt.date)} ·{" "}
                    {formatSlotRange(appt.slot, appt.serviceDuration)} ·{" "}
                    {formatDuration(appt.serviceDuration)}
                  </p>
                  <div className="flex flex-wrap items-center gap-(--space-2)">
                    <p className="text-sm text-(--color-color-text-secondary)">
                      {appt.name} · {appt.phone}
                    </p>
                    <span className="rounded-full bg-(--color-surface-hover) px-(--space-3) py-(--space-1) text-xs font-medium text-(--color-color-text-secondary)">
                      {inDaysLabel(appt.date)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-(--space-3) sm:items-end">
                  <span
                    className={[
                      "rounded-full border border-(--color-border) bg-(--color-surface-hover) px-(--space-3) py-(--space-1) text-xs font-medium",
                      status.className,
                    ].join(" ")}
                  >
                    {status.label}
                  </span>
                  <p className="text-lg font-bold text-(--color-color-text)">
                    {formatPrice(appt.servicePrice)}
                  </p>
                  {appt.status === "upcoming" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(appt.id)}
                      className="rounded-md border border-(--color-border) px-(--space-5) py-(--space-2) text-sm font-medium text-(--color-color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-(--space-6) rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) p-(--space-8) text-center">
          <p className="text-sm font-medium text-(--color-color-text)">
            No {activeTab.toLowerCase()} appointments
          </p>
          <p className="mt-(--space-2) text-sm text-(--color-color-text-secondary)">
            {activeTab === "Upcoming"
              ? "Book a consultation and it will show up here."
              : "Appointments will appear here once they move to this tab."}
          </p>
          {activeTab === "Upcoming" && (
            <Link
              to="/book"
              className="mt-(--space-6) inline-flex rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85"
            >
              Book a consultation
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
