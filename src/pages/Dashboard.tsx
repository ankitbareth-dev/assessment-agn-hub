type Appointment = {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  client: string;
  phone: string;
  inDays: string;
  price: string;
};

const UPCOMING: Appointment[] = [
  {
    id: 1,
    title: "Solution Architecture Review",
    date: "Thu, 29 Oct",
    time: "11:00 am – 12:00 pm",
    duration: "1 hr",
    client: "Aarav Sharma",
    phone: "+91 98765 43210",
    inDays: "In 3 days",
    price: "₹4,500",
  },
  {
    id: 2,
    title: "WordPress Maintenance Retainer",
    date: "Fri, 30 Oct",
    time: "4:30 pm – 5:30 pm",
    duration: "1 hr",
    client: "Aarav Sharma",
    phone: "+91 98765 43210",
    inDays: "In 4 days",
    price: "₹2,999",
  },
  {
    id: 3,
    title: "React Performance Audit",
    date: "Mon, 2 Nov",
    time: "10:00 am – 11:30 am",
    duration: "1.5 hr",
    client: "Priya Nair",
    phone: "+91 90000 12345",
    inDays: "In 7 days",
    price: "₹6,200",
  },
];

const TABS = [
  { label: "Upcoming", count: 3, active: true },
  { label: "Completed", count: 2, active: false },
  { label: "Cancelled", count: 1, active: false },
];

export default function Dashboard() {
  return (
    <main className="mx-auto w-full max-w-(--container-width) px-(--space-6) py-(--space-8)">
      <h1 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold">
        Appointments
      </h1>
      <p className="mt-(--space-2) text-(--color-text-secondary)">
        Track upcoming sessions and review past ones.
      </p>

      <div className="mt-(--space-6) flex w-full items-center gap-(--space-1) overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-1) scrollbar-none [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={[
              "flex shrink-0 items-center gap-(--space-2) whitespace-nowrap rounded-md px-(--space-4) py-(--space-2) text-sm font-medium [transition:var(--transition-fast)]",
              tab.active
                ? "bg-(--color-primary) text-(--color-primary-text)!"
                : "text-(--color-text-secondary) hover:text-(--color-text)",
            ].join(" ")}
          >
            {tab.label}
            <span className="opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-(--space-6) flex flex-col gap-(--space-4)">
        {UPCOMING.map((appt) => (
          <article
            key={appt.id}
            className="flex flex-col gap-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6) [transition:var(--transition-fast)] hover:border-(--color-border-hover) sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-(--space-2)">
              <h2 className="text-base font-semibold text-(--color-text)">
                {appt.title}
              </h2>
              <p className="text-sm text-(--color-text-secondary)">
                {appt.date} · {appt.time} · {appt.duration}
              </p>
              <div className="flex flex-wrap items-center gap-(--space-2)">
                <p className="text-sm text-(--color-text-secondary)">
                  {appt.client} · {appt.phone}
                </p>
                <span className="rounded-(--radius-full) bg-(--color-surface-hover) px-(--space-3) py-(--space-1) text-xs font-medium ext-(--color-text-secondary)">
                  {appt.inDays}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-(--space-3) sm:items-end">
              <span className="rounded-(--radius-full) border border-(--color-border) bg-(--color-surface-hover) px-(--space-3) py-(--space-1) text-xs font-medium text-(--color-success)">
                Upcoming
              </span>
              <p className="text-lg font-bold ext-(--color-text)">
                {appt.price}
              </p>
              <button
                type="button"
                className="rounded-md border border-(--color-border) px-(--space-5) py-(--space-2) text-sm font-medium ext-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
              >
                Cancel
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
