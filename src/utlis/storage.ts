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

export const appStorage = {
  saveBooking(input: BookingInput): BookingRecord {
    const record: BookingRecord = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "upcoming",
    };

    const bookings = readBookings();
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
