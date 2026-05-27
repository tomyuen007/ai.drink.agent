export class TextEdit {
  readonly isValid: boolean;
  readonly isEmpty: boolean;

  constructor(
    public readonly value: string = "",
    public readonly error: string = "",
  ) {
    this.isEmpty = value.trim().length === 0;
    this.isValid = !this.isEmpty && error === "";
  }

  static empty(): TextEdit {
    return new TextEdit();
  }
}
