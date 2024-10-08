import { Signal } from '@angular/core';

export interface IFieldMask {
  initPreClean(overloadPreCleanValues: (key: string, value: string) => string): this;
  init(name: string, mask: string, requirePrefix?: boolean): this;
  initSignal(name: string, mask: Signal<string>): this;
  logChanges(): this;
  result: Signal<string>;
  destroy(): void;
}