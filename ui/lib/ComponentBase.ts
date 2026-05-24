export interface IComponentBase {
  id:       string;
  tag:      string;
  callback(): this;
  describe(): string;
}

export class ComponentBase implements IComponentBase {
  constructor(
    public id:  string = "",
    public tag: string = "",
  ) {}

  callback(): this {
    return this;
  }

  describe(): string {
    return `[${this.tag}] ${this.id}`;
  }
}
