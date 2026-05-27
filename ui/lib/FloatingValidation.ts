export interface FloatingValidationOptions {
  precision?:     number;   // max decimal places; default 2
  min?:           number;   // inclusive lower bound
  max?:           number;   // inclusive upper bound
  allowNegative?: boolean;  // default true
}

export class FloatingValidation {
  static readonly DEFAULT_PRECISION = 2;

  // Builds the regex for a given precision and sign policy.
  // Accepts: optional leading sign, one or more digits, optional decimal up to `precision` places.
  // Rejects: bare ".", bare "-", "1.2.3", values exceeding precision.
  static regex(precision = this.DEFAULT_PRECISION, allowNegative = true): RegExp {
    const sign = allowNegative ? "-?" : "";
    return new RegExp(`^${sign}\\d+(\\.\\d{1,${precision}})?$`);
  }

  static parse(value: string): number | null {
    const n = parseFloat(value.trim());
    return isNaN(n) ? null : n;
  }

  // Returns an error message or null if valid.
  // Empty / whitespace-only input returns null (neutral — caller decides if required).
  static validate(value: string, options: FloatingValidationOptions = {}): string | null {
    const {
      precision     = this.DEFAULT_PRECISION,
      min,
      max,
      allowNegative = true,
    } = options;

    if (!value.trim()) return null;

    if (!this.regex(precision, allowNegative).test(value.trim())) {
      const sign = allowNegative ? "" : "positive ";
      const dp   = precision === 1 ? "1 decimal place" : `up to ${precision} decimal places`;
      return `Enter a valid ${sign}number with ${dp}.`;
    }

    const n = this.parse(value);
    if (n === null) return "Enter a valid number.";
    if (min !== undefined && n < min) return `Value must be at least ${min}.`;
    if (max !== undefined && n > max) return `Value must be no more than ${max}.`;
    return null;
  }
}
