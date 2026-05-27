export class PasswordValidation {
  static readonly MIN_LENGTH = 6;

  // Returns an error message or null if valid; empty input returns null (neutral).
  static validate(value: string): string | null {
    if (!value) return null;
    return value.length >= this.MIN_LENGTH
      ? null
      : `At least ${this.MIN_LENGTH} characters required.`;
  }
}
