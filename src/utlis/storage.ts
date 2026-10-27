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
};

const BOOKINGS_KEY = "appointment_bookings";

function readBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BookingRecord[];
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
    };

    const bookings = readBookings();
    bookings.push(record);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    return record;
  },
};
