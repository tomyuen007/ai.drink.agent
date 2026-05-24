import { ComponentBase } from "./ComponentBase";
import type { IComponentBase } from "./ComponentBase";

export interface IAskResponse extends IComponentBase {
  city:     string;
  question: string;
  answer:   string;
  error?:   string;
}

export class AskResponse extends ComponentBase implements IAskResponse {
  constructor(
    id:              string,
    tag:             string,
    public city:     string,
    public question: string,
    public answer:   string,
    public error?:   string,
  ) { super(id, tag); }
}
