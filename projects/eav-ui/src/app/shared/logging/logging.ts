import { EavLogger } from './eav-logger';
import { LogSpecs } from './log-specs';
import { LoggerFnNoop } from './logger-fn-noop';
import { LoggerFnReal } from './logger-fn-real';
import { LoggerFn } from './logger-fn.interface';

//
// This is a special section for logging.
// A core goal is that logging will never break the application, so it should be null-safe
// and work even if for example the .log property is null.

/**
 * Main entry function to create a logger for a class.
 * TODO: If logging is disabled, it will create a dummy logger that does nothing.
 * - wait with this, until we've refactored everything to use the new classLog and the logFn / logFnIf functions
 * @param logSpecs 
 * @returns 
 */
export function classLog<TSpecs extends unknown = any>(logSpecs: LogSpecs<TSpecs>) {
  return new EavLogger(logSpecs);
}

export function logFn(parent: { log: EavLogger }, name: string, data?: Record<string, unknown>, message?: string) {
  const log = parent.log;
  return (log == null || !log.enabled)
    ? new LoggerFnNoop()
    : new LoggerFnReal(log, name, message, data);
}

/**
 * Create a logger for the current function, but only if certain specs are enabled.
 * Otherwise it will create a dummy logger that does nothing.
 * @param log 
 * @param key 
 * @param data 
 * @returns 
 */
export function logFnIf<TSpecs extends unknown = any>(
  parent: { log: EavLogger<TSpecs> },
  key: BooleanKeys<TSpecs> & string,
  data?: Record<string, unknown>,
  message?: string
): LoggerFn {
  const log = parent.log;
  if (log == null || !log.enabled)
    return new LoggerFnNoop();

  // if we don't have specs, continue logging
  // if we have specs, then try to check if the key or 'all' are enabled
  const specs = log.specs;
  if (specs == null || !!specs[key] || !!(specs as { all: boolean })['all'])
    return logFn({ log }, key, data, message);

  return new LoggerFnNoop();
}





/** 
 * Helper to only allow boolean keys in the specs object.
 * https://stackoverflow.com/questions/50851263/how-do-i-require-a-keyof-to-be-for-a-property-of-a-specific-type
*/
type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];
type BooleanSpecs<T> = { [k in BooleanKeys<T>]: boolean };