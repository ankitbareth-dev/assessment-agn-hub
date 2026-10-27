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
import {
  appStorage,
  BookingConflictError,
  type BookingRecord,
} from "../utlis/storage";

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

function slotToMinutes(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  return hours * 60 + minutes;
}

function isSlotPassed(date: Date, slot: string, now: number) {
  const [hours, minutes] = slot.split(":").map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime.getTime() <= now;
}

const inputClassName = (hasError: boolean) =>
  [
    "mt-(--space-2) w-full rounded-lg border bg-(--color-surface) px-(--space-4) py-(--space-3) text-sm text-(--color-text) outline-none [transition:var(--transition-fast)] placeholder:text-(--color-text-muted) focus:border-(--color-border-hover)",
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
  const [confirmed, setConfirmed] = useState<BookingRecord | null>(null);
  const [bookingError, setBookingError] = useState("");

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
        <p className="mt-(--space-2) text-(--color-text-secondary)">
          The service you're looking for doesn't exist.
        </p>
        <Link
          to="/book"
          className="mt-(--space-6) inline-flex rounded-lg border border-(--color-border) px-(--space-5) py-(--space-2) text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover)"
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

  const bookings = appStorage.getBookings();

  const isSlotBooked = (slot: string) => {
    const start = slotToMinutes(slot);
    const end = start + service.duration;

    return bookings.some((booking) => {
      if (
        booking.status === "cancelled" ||
        booking.date.slice(0, 10) !== selectedDate?.toLocaleDateString("en-CA")
      ) {
        return false;
      }

      const existingStart = slotToMinutes(booking.slot);
      const existingEnd = existingStart + booking.serviceDuration;

      return start < existingEnd && existingStart < end;
    });
  };

  const availableCount =
    selectedDate !== null
      ? TIME_SLOTS.filter(
          (slot) =>
            !isSlotPassed(selectedDate, slot, now) && !isSlotBooked(slot),
        ).length
      : 0;
  const currentStep = confirmed ? STEPS.length + 1 : step;

  const reviewRows =
    selectedDate !== null && selectedIndex !== null && selectedSlot !== null
      ? [
          { label: "Service", value: service.name },
          {
            label: "Date",
            value: formatDateLabel(selectedDate, selectedIndex),
          },
          { label: "Time", value: formatSlotLabel(selectedSlot) },
          { label: "Duration", value: formatDuration(service.duration) },
          { label: "Price", value: formatPrice(service.price) },
          { label: "Full name", value: details.name },
          { label: "Email", value: details.email },
          { label: "Phone number", value: details.phone },
        ]
      : [];

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

  const handleConfirm = () => {
    if (selectedDate === null || selectedSlot === null) return;

    setBookingError("");

    try {
      const record = appStorage.saveBooking({
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        date: selectedDate.toISOString(),
        slot: selectedSlot,
        name: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone,
      });

      setConfirmed(record);
    } catch (error) {
      if (error instanceof BookingConflictError) {
        setBookingError(error.message);
        setStep(2);
        setSelectedSlot(null);
        return;
      }

      setBookingError("Unable to save your booking. Please try again.");
    }
  };

  const handleBookAnother = () => {
    setSelectedIndex(null);
    setSelectedSlot(null);
    setDetails({ name: "", email: "", phone: "" });
    setErrors({});
    setSubmitted(false);
    setConfirmed(null);
    setStep(1);
    setBookingError("");
  };

  return (
    <main className="mx-auto w-full max-w-(--container-width) px-(--space-6) py-(--space-8)">
      <section className="rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
        <div className="flex items-start justify-between gap-(--space-4)">
          <div className="flex items-center gap-(--space-4)">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-(--color-surface-hover)">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-(--color-text)"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-(--color-text) sm:text-xl">
                {service.name}
              </h1>
              <p className="mt-(--space-1) text-sm text-(--color-text-secondary)">
                {formatDuration(service.duration)} ·{" "}
                {formatPrice(service.price)}
              </p>
            </div>
          </div>

          <Link
            to="/book"
            className="shrink-0 rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
          >
            Change
          </Link>
        </div>

        <div className="mt-(--space-6) border-t border-(--color-border)" />

        <ol className="mt-(--space-6) flex items-center">
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
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
                        ? "bg-(--color-primary) text-(--color-primary-text)!"
                        : "border border-(--color-border) text-(--color-text-secondary)",
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
                        ? "text-(--color-text)"
                        : isActive
                          ? "font-semibold text-(--color-text)"
                          : "text-(--color-text-secondary)",
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
      {!confirmed && (
        <>
          {step === 1 && (
            <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
              <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
                <h2 className="text-base font-semibold text-(--color-text)">
                  Choose a date
                </h2>
                <p className="text-xs text-(--color-text-muted)">
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
                        ? "border-transparent bg-(--color-primary) text-(--color-primary-text)!"
                        : "border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-border-hover) hover:text-(--color-text)",
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
                  className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </section>
          )}

          {step === 2 && selectedDate && selectedIndex !== null && (
            <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
              <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
                <h2 className="text-base font-semibold text-(--color-text)">
                  Choose a time
                </h2>
                <p className="text-xs text-(--color-text-muted)">
                  {formatDateLabel(selectedDate, selectedIndex)} ·{" "}
                  {availableCount === 0
                    ? "No slots left for this date"
                    : `${availableCount} of ${TIME_SLOTS.length} available`}
                </p>
              </div>

              <div className="mt-(--space-4) grid grid-cols-3 gap-(--space-2) sm:grid-cols-4 md:grid-cols-5">
                {TIME_SLOTS.map((slot) => {
                  const isPassed = isSlotPassed(selectedDate, slot, now);
                  const isBooked = isSlotBooked(slot);
                  const isUnavailable = isPassed || isBooked;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setBookingError("");
                      }}
                      disabled={isUnavailable}
                      aria-pressed={selectedSlot === slot}
                      title={
                        isBooked ? "This slot is already booked" : undefined
                      }
                      className={[
                        "flex min-h-11 w-full items-center justify-center rounded-lg border px-2 py-3 text-sm font-medium whitespace-nowrap [transition:var(--transition-fast)]",
                        isUnavailable
                          ? "cursor-not-allowed border-(--color-border) bg-(--color-surface) text-(--color-text-muted) opacity-50"
                          : selectedSlot === slot
                            ? "border-transparent bg-(--color-primary) text-(--color-primary-text)"
                            : "border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) enabled:hover:border-(--color-border-hover) enabled:hover:text-(--color-text)",
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
                  className="shrink-0 rounded-lg border border-(--color-border) px-6 py-3 text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSlotValid}
                  onClick={() => setStep(3)}
                  className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
              <h2 className="text-base font-semibold text-(--color-text)">
                Your details
              </h2>
              <p className="mt-(--space-1) text-sm text-(--color-text-secondary)">
                We use these only to confirm and manage your appointment.
              </p>

              <div className="mt-(--space-6)">
                <label
                  htmlFor="full-name"
                  className="text-sm font-medium text-(--color-text)"
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
                    className="text-sm font-medium text-(--color-text)"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={details.email}
                    onChange={(event) =>
                      updateDetail("email", event.target.value)
                    }
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
                    className="text-sm font-medium text-(--color-text)"
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
                {bookingError && (
                  <p
                    role="alert"
                    className="mt-(--space-4) text-sm text-red-500"
                  >
                    {bookingError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="shrink-0 rounded-lg border border-(--color-border) px-6 py-3 text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleReview}
                  className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85"
                >
                  Review booking
                </button>
              </div>
            </section>
          )}

          {step === 4 && selectedDate && (
            <section className="mt-(--space-4) rounded-lg border border-(--color-border) bg-(--color-surface) p-(--space-6)">
              <h2 className="text-base font-semibold text-(--color-text)">
                Review booking
              </h2>
              <p className="mt-(--space-1) text-sm text-(--color-text-secondary)">
                Check everything looks right, then confirm your appointment.
              </p>

              <div className="mt-(--space-6) overflow-hidden rounded-lg border border-(--color-border)">
                {reviewRows.map((row, index) => (
                  <div
                    key={row.label}
                    className={[
                      "flex items-center justify-between gap-(--space-4) px-(--space-4) py-(--space-3) text-sm",
                      index % 2 === 0
                        ? "bg-(--color-surface)"
                        : "bg-(--color-surface-hover)",
                    ].join(" ")}
                  >
                    <span className="text-(--color-text-secondary)">
                      {row.label}
                    </span>
                    <span className="text-right font-medium text-(--color-text)">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-(--space-6) flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="shrink-0 rounded-lg border border-(--color-border) px-6 py-3 text-sm font-medium text-(--color-text) [transition:var(--transition-fast)] hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-lg bg-(--color-primary) px-(--space-6) py-(--space-3) text-sm font-semibold text-(--color-primary-text)! [transition:var(--transition-fast)] hover:opacity-85"
                >
                  Confirm booking
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {confirmed && selectedDate && selectedIndex !== null && (
        <section className="mt-(--space-4) overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
          <div className="flex flex-col items-center px-(--space-6) py-10 text-center sm:py-12">
            <div className="flex size-16 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-hover)">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-(--color-text)"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <p className="mt-(--space-6) text-xs font-semibold uppercase tracking-[0.2em] text-(--color-text-muted)">
              Booking complete
            </p>

            <h2 className="mt-(--space-2) text-2xl font-extrabold text-(--color-text) sm:text-3xl">
              You're all set.
            </h2>

            <p className="mt-(--space-2) max-w-md text-sm leading-6 text-(--color-text-secondary)">
              Your appointment has been saved successfully. Here are your
              booking details for reference.
            </p>

            <div className="mt-(--space-8) w-full max-w-lg overflow-hidden rounded-lg border border-(--color-border) text-left">
              <div className="border-b border-(--color-border) p-(--space-4)">
                <p className="text-xs text-(--color-text-muted)">Service</p>
                <p className="mt-1 font-semibold text-(--color-text)">
                  {confirmed.serviceName}
                </p>
                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  {formatDuration(confirmed.serviceDuration)} ·{" "}
                  {formatPrice(confirmed.servicePrice)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-(--space-4) p-(--space-4)">
                <div>
                  <p className="text-xs text-(--color-text-muted)">Date</p>
                  <p className="mt-1 text-sm font-medium text-(--color-text)">
                    {selectedDate.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-(--color-text-muted)">Time</p>
                  <p className="mt-1 text-sm font-medium text-(--color-text)">
                    {formatSlotLabel(confirmed.slot)}
                  </p>
                </div>
              </div>

              <div className="border-t border-(--color-border) p-(--space-4)">
                <p className="text-xs text-(--color-text-muted)">Booked for</p>
                <p className="mt-1 text-sm font-medium text-(--color-text)">
                  {confirmed.name}
                </p>
                <p className="mt-1 break-all text-sm text-(--color-text-secondary)">
                  {confirmed.email}
                </p>
              </div>
            </div>

            <div className="mt-(--space-8) flex w-full max-w-lg flex-col gap-(--space-3) sm:flex-row">
              <button
                type="button"
                onClick={handleBookAnother}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-(--color-primary) px-6 py-3 text-sm font-semibold text-(--color-primary-text) transition-opacity hover:opacity-85"
              >
                Book another appointment
              </button>

              <Link
                to="/dashboard"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-(--color-border) px-6 py-3 text-sm font-medium text-(--color-text) transition-colors hover:border-(--color-border-hover) hover:bg-(--color-surface-hover)"
              >
                View dashboard
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
