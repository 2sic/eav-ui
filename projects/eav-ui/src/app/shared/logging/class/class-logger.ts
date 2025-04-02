import { FnLogger } from '../fn/fn-logger.interface';
import { RxTapDebug } from '../rx-debug-dbg';

export interface ClassLogger<TSpecs extends unknown = any> {
  svcId: string;
  name: string;
  enabled: boolean;
  enableChildren: boolean;
  specs: TSpecs;

  extendName(addOn: string): this;
  nameWithSvcId: string;
  inherit(parent: ClassLogger<TSpecs>): void;
  forceEnable(enabled: boolean | null): void;

  a(message: string, data?: RecordOrGenerator): void;
  aIf(key: BooleanKeys<TSpecs> & string, data?: RecordOrGenerator, message?: string): void;
  aIfInList(list: StringArrayKeys<TSpecs>, subKey: string, data?: RecordOrGenerator, message?: string): void;

  rxTap(name: string, options?: { enabled?: boolean; jsonify?: boolean }): RxTapDebug;
  fn(name: string, data?: RecordOrGenerator, message?: string): FnLogger;
  fnCond(condition: boolean, name: string, data?: RecordOrGenerator, message?: string): FnLogger;
  fnIf(key: BooleanKeys<TSpecs> & string, data?: RecordOrGenerator, message?: string): FnLogger;
  fnIfInList(
    key: BooleanKeys<TSpecs> & string,
    /** typically 'fields' - must be an array property of the specs */
    list: StringArrayKeys<TSpecs>,
    subKey: string,
    data?: RecordOrGenerator,
    message?: string
  ): FnLogger;
}

export type RecordOrGenerator = Record<string, unknown> | (() => Record<string, unknown>);

/** 
 * Helper to only allow boolean keys in the specs object.
 * https://stackoverflow.com/questions/50851263/how-do-i-require-a-keyof-to-be-for-a-property-of-a-specific-type
*/
export type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];
type BooleanSpecs<T> = { [k in BooleanKeys<T>]: boolean };

export type StringArrayKeys<T> = { [k in keyof T]: T[k] extends string[] ? k : never }[keyof T];

