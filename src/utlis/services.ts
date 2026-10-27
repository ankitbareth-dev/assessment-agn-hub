export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
};

export type UserDetails = {
  name: string;
  email: string;
  phone: string;
};

export type DetailErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

export function validateDetails(details: UserDetails): DetailErrors {
  const errors: DetailErrors = {};

  const name = details.name.trim();
  if (name.length === 0) {
    errors.name = "Full name is required";
  } else if (name.length < 3) {
    errors.name = "Full name must be at least 3 characters";
  }

  const email = details.email.trim();
  if (email.length === 0) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  const phone = details.phone.trim();
  if (phone.length === 0) {
    errors.phone = "Mobile number is required";
  } else if (!/^\d{10}$/.test(phone)) {
    errors.phone = "Mobile number must be exactly 10 digits";
  }

  return errors;
}
