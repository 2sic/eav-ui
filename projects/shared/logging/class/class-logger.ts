import { FnLogger } from '../fn/fn-logger.interface';

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

  // 2026-02-24 2dm - removed this, so that logs don't contain deep dependencies which are then also used in gps etc. to rxJs
  // rxTap(name: string, options?: { enabled?: boolean; jsonify?: boolean }): RxTapDebug;
  fn(name: string, data?: RecordOrGenerator, message?: string): FnLogger;
  fnCond(condition: boolean, name: string, data?: RecordOrGenerator, message?: string): FnLogger;
  fnIf(key: BooleanKeys<TSpecs> & string, data?: RecordOrGenerator, message?: string): FnLogger;

  /** Create a logger for a function if the provided key is in the list of the log-specs */
  fnIfInList(
    /** Logger name */
    key: BooleanKeys<TSpecs> & string,
    /** property name of the logSpecs; typically 'fields' - must be an array property of the specs */
    listName: StringArrayKeys<TSpecs>,
    /** sub-key to check if it's in the list */
    value: string,
    data?: RecordOrGenerator,
    message?: string
  ): FnLogger;

  /** Create a logger for a function if the provided key is in the logSpecs.fields */
  fnIfInFields(
    /** Logger name */
    key: BooleanKeys<TSpecs> & string,
    /** field name to check if it's in the logSpecs.fields */
    fieldName: string,
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

