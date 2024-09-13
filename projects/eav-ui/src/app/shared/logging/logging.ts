import { EavLogger } from './eav-logger';

//
// This is a special section for logging.
// A core goal is that logging will never break the application, so it should be null-safe
// and work even if for example the .log property is null.

/**
 * Main entry function to create a logger for a class.
 * 
 * Usage: `log = classLog({MyClass})` // this will allow it to auto-detect the class name
 * 
 * TODO: If logging is disabled, it will create a dummy logger that does nothing.
 * - wait with this, until we've refactored everything to use the new classLog and the logFn / logFnIf functions
 * @param owner a mini-class with 1 property, being the name of the class; optionally also the name as string, but not recommended
 * @param specs optional object containing further specs. If provided, can be used in `log.fnIf()` calls 
 * @returns 
 */
export function classLog<TSpecs extends Record<string, unknown> = any>(
  owner: Record<string, unknown> | string,
  specs?: TSpecs,
  enabled: boolean = false
): EavLogger<TSpecs> { // ClassLogger<TSpecs> {
  // Pick the first key as the name of the class
  const name = (() => {
    if (!owner) return 'unknown';
    if (typeof owner === 'string') return owner;
    return (owner ? Object.keys(owner)[0] : null) ?? 'unknown';
  })();
  
  const logSpecs = {
    enabled,
    name,
    specs: specs ?? {} as TSpecs,
  }
  return new EavLogger<TSpecs>(logSpecs);
}

// function classLogTestDoNotUseATM<TSpecs extends unknown = any>(logSpecs: LogSpecs<TSpecs>): EavLogger<TSpecs>  {
//   return new EavLogger(logSpecs);
// }


// export function logFn(parent: { log: EavLogger }, name: string, data?: Record<string, unknown>, message?: string) {
//   const log = parent.log;
//   return (log == null || !log.enabled)
//     ? new FnLoggerNoOp()
//     : new FnLoggerReal(log, name, message, data);
// }

// /**
//  * Create a logger for the current function, but only if certain specs are enabled.
//  * Otherwise it will create a dummy logger that does nothing.
//  * @param log 
//  * @param key 
//  * @param data 
//  * @returns 
//  */
// export function logFnIf<TSpecs extends unknown = any>(
//   parent: { log: EavLogger<TSpecs> },
//   key: BooleanKeys<TSpecs> & string,
//   data?: Record<string, unknown>,
//   message?: string
// ): FnLogger {
//   const log = parent.log;
//   if (log == null || !log.enabled)
//     return new FnLoggerNoOp();

//   // if we don't have specs, continue logging
//   // if we have specs, then try to check if the key or 'all' are enabled
//   const specs = log.specs;
//   if (specs == null || !!specs[key] || !!(specs as { all: boolean })['all'])
//     return log.fn(key, data, message);

//   return new FnLoggerNoOp();
// }





/** 
 * Helper to only allow boolean keys in the specs object.
 * https://stackoverflow.com/questions/50851263/how-do-i-require-a-keyof-to-be-for-a-property-of-a-specific-type
*/
type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];
type BooleanSpecs<T> = { [k in BooleanKeys<T>]: boolean };