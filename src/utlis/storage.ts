export type BookingStatus = "upcoming" | "completed" | "cancelled";

export type BookingInput = {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;
  slot: string;
  name: string;
  email: string;
  phone: string;
};

export type BookingRecord = BookingInput & {
  id: string;
  createdAt: string;
  status: BookingStatus;
};

const BOOKINGS_KEY = "appointment_bookings";

export class BookingConflictError extends Error {
  constructor() {
    super("This time slot is already booked. Please choose another slot.");
    this.name = "BookingConflictError";
  }
}

function readBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as BookingRecord[];

    return parsed.map((record) => ({
      ...record,
      status: record.status ?? "upcoming",
    }));
  } catch {
    return [];
  }
}

function getSlotStart(slot: string): number {
  const [hours, minutes] = slot.split(":").map(Number);
  return hours * 60 + minutes;
}

function findConflictingAppointment(
  input: BookingInput,
  bookings: BookingRecord[],
): BookingRecord | undefined {
  const newStart = getSlotStart(input.slot);
  const newEnd = newStart + input.serviceDuration;

  return bookings.find((booking) => {
    if (booking.status === "cancelled" || booking.date !== input.date) {
      return false;
    }

    const existingStart = getSlotStart(booking.slot);
    const existingEnd = existingStart + booking.serviceDuration;

    return newStart < existingEnd && existingStart < newEnd;
  });
}

export const appStorage = {
  saveBooking(input: BookingInput): BookingRecord {
    const bookings = readBookings();

    if (findConflictingAppointment(input, bookings)) {
      throw new BookingConflictError();
    }

    const record: BookingRecord = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "upcoming",
    };

    bookings.push(record);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    return record;
  },

  getBookings(): BookingRecord[] {
    return readBookings();
  },

  updateBookingStatus(id: string, status: BookingStatus): BookingRecord[] {
    const bookings = readBookings().map((record) =>
      record.id === id ? { ...record, status } : record,
    );

    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    return bookings;
  },
};
