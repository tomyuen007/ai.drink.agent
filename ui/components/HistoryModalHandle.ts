import { ComponentBase } from "../lib/ComponentBase";
import type { IComponentBase } from "../lib/ComponentBase";

export interface IHistoryModalHandle extends IComponentBase {
  open():  void;
  close(): void;
}

export class HistoryModalHandle extends ComponentBase implements IHistoryModalHandle {
  constructor(id: string, tag: string) { super(id, tag); }
  open():  void {}
  close(): void {}
}
