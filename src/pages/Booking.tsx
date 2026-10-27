import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { SERVICES } from "../data/services";
import {
  formatDuration,
  formatPrice,
  validateDetails,
  type DetailErrors,
  type UserDetails,
} from "../utlis/services";

const STEPS = ["Date", "Time", "Your details", "Review"];

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

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

const formatSlotLabel = (slot: string) => {
  const [hours, minutes] = slot.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

function isSlotPassed(date: Date, slot: string, now: number) {
  const [hours, minutes] = slot.split(":").map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime.getTime() <= now;
}

const inputClassName = (hasError: boolean) =>
  [
    "mt-(--space-2) w-full rounded-lg border bg-(--color-surface) px-(--space-4) py-(--space-3) text-sm text-(--color-color-text) outline-none [transition:var(--transition-fast)] placeholder:text-(--color-color-text-muted) focus:border-(--color-border-hover)",
    hasError ? "border-red-600" : "border-(--color-border)",
  ].join(" ");

export default function Booking() {
  const { serviceId } = useParams();
  const service = SERVICES.find((s) => s.id === Number(serviceId));

  const dates = useMemo(() => getBookableDates(), []);
  const [now, setNow] = useState(() => Date.now());
  const [step, setStep] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [details, setDetails] = useState<UserDetails>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<DetailErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

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

  const selectedDate = selectedIndex !== null ? dates[selectedIndex] : null;
  const selectedSlotValid =
    selectedDate !== null &&
    selectedSlot !== null &&
    !isSlotPassed(selectedDate, selectedSlot, now);
  const availableCount =
    selectedDate !== null
      ? TIME_SLOTS.filter((slot) => !isSlotPassed(selectedDate, slot, now))
          .length
      : 0;

  const updateDetail = (field: keyof UserDetails, value: string) => {
    const next = { ...details, [field]: value };
    setDetails(next);
    if (submitted) setErrors(validateDetails(next));
  };

  const handleReview = () => {
    const nextErrors = validateDetails(details);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length === 0) {
      setStep(4);
    }
  };

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
            const isCompleted = stepNumber < step;
            const isActive = stepNumber === step;
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
                      isActive || isCompleted
                        ? "bg-(--color-primary) text-(--color-color-primary-text)!"
                        : "border border-(--color-border) text-(--color-color-text-secondary)",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </span>
                  <span
                    className={[
                      "hidden text-sm sm:inline",
                      isCompleted
                        ? "text-(--color-color-text)"
                        : isActive
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

      {step === 1 && (
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
                onClick={() => {
                  if (selectedIndex !== index) setSelectedSlot(null);
                  setSelectedIndex(index);
                }}
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
              onClick={() => setStep(2)}
              className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && selectedDate && selectedIndex !== null && (
        <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
          <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
            <h2 className="text-base font-semibold text-(--color-color-text)">
              Choose a time
            </h2>
            <p className="text-xs text-(--color-color-text-muted)">
              {formatDateLabel(selectedDate, selectedIndex)} ·{" "}
              {availableCount === 0
                ? "No slots left for this date"
                : `${availableCount} of ${TIME_SLOTS.length} available`}
            </p>
          </div>

          <div className="mt-(--space-4) grid grid-cols-3 gap-(--space-2) sm:grid-cols-4 md:grid-cols-5">
            {TIME_SLOTS.map((slot) => {
              const isPassed = isSlotPassed(selectedDate, slot, now);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  disabled={isPassed}
                  aria-pressed={selectedSlot === slot}
                  className={[
                    "rounded-lg border px-(--space-3) py-(--space-2) text-sm font-medium [transition:var(--transition-fast)]",
                    isPassed
                      ? "cursor-not-allowed border-(--color-border) bg-(--color-surface) text-(--color-color-text-muted) line-through opacity-60"
                      : selectedSlot === slot
                        ? "border-transparent bg-(--color-primary) text-(--color-color-primary-text)!"
                        : "border-(--color-border) bg-(--color-surface) text-(--color-color-text-secondary) enabled:hover:border-(--color-border-hover) enabled:hover:text-(--color-color-text)",
                  ].join(" ")}
                >
                  {formatSlotLabel(slot)}
                </button>
              );
            })}
          </div>

          <div className="mt-(--space-6) flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-(--color-border) px-(--space-5) py-(--space-3) text-sm font-medium text-(--color-color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!selectedSlotValid}
              onClick={() => setStep(3)}
              className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
          <h2 className="text-base font-semibold text-(--color-color-text)">
            Your details
          </h2>
          <p className="mt-(--space-1) text-sm text-(--color-color-text-secondary)">
            We use these only to confirm and manage your appointment.
          </p>

          <div className="mt-(--space-6)">
            <label
              htmlFor="full-name"
              className="text-sm font-medium text-(--color-color-text)"
            >
              Full name
            </label>
            <input
              id="full-name"
              type="text"
              value={details.name}
              onChange={(event) => updateDetail("name", event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className={inputClassName(!!errors.name)}
            />
            {errors.name && (
              <p className="mt-(--space-1) text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mt-(--space-4) grid gap-(--space-4) sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-(--color-color-text)"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={details.email}
                onChange={(event) => updateDetail("email", event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className={inputClassName(!!errors.email)}
              />
              {errors.email && (
                <p className="mt-(--space-1) text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium text-(--color-color-text)"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={details.phone}
                onChange={(event) =>
                  updateDetail(
                    "phone",
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                placeholder="10-digit mobile number"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className={inputClassName(!!errors.phone)}
              />
              {errors.phone && (
                <p className="mt-(--space-1) text-xs text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="mt-(--space-6) flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-(--color-border) px-(--space-5) py-(--space-3) text-sm font-medium text-(--color-color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleReview}
              className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85"
            >
              Review booking
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
