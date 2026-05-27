export type EmailPhoneResult =
  | { valid: true;  type: "email" | "phone" }
  | { valid: false; error: string };

export class EmailPhoneValidation {
  // RFC 5321-compatible local part + domain; rejects missing TLD and bare @
  static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  // Accepts E.164, North American (with parens/dashes/dots/spaces), 7–20 significant digits
  static readonly PHONE_REGEX = /^\+?[\d\s\-(). ]{7,20}$/;

  static validateEmail(value: string): string | null {
    if (!value) return "Email is required.";
    return this.EMAIL_REGEX.test(value) ? null : "Enter a valid email address (e.g. you@example.com).";
  }

  static validatePhone(value: string): string | null {
    if (!value) return "Phone number is required.";
    return this.PHONE_REGEX.test(value) ? null : "Enter a valid phone number (e.g. +1 555 000 0000).";
  }

  // Login: single field that is either email or phone
  static validate(value: string): EmailPhoneResult {
    if (!value) return { valid: false, error: "Enter your email or phone number." };
    if (value.includes("@")) {
      const error = this.validateEmail(value);
      return error ? { valid: false, error } : { valid: true, type: "email" };
    }
    const error = this.validatePhone(value);
    return error ? { valid: false, error } : { valid: true, type: "phone" };
  }

  // Sign-up: separate fields; at least one required, each validated if provided
  static validateSignUp(email: string, phone: string): string | null {
    if (!email && !phone) return "Enter at least an email or phone number.";
    if (email) {
      const err = this.validateEmail(email);
      if (err) return err;
    }
    if (phone) {
      const err = this.validatePhone(phone);
      if (err) return err;
    }
    return null;
  }
}
