import { ComponentBase } from "./ComponentBase";
import type { IComponentBase } from "./ComponentBase";

export interface ISyncStates extends IComponentBase {
  open():  void;
  close(): void;
}

export class SyncStates extends ComponentBase implements ISyncStates {
  constructor(id: string, tag: string) { super(id, tag); }
  open():  void {}
  close(): void {}
}
