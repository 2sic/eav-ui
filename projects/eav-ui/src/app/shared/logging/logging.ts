import { ClassLoggerReal } from './class/class-logger-real';
import { ClassLogger } from './class/class-logger';
import { ClassLoggerNoop } from './class/class-logger-noop';

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
): ClassLogger<TSpecs> {
  if (!enabled) return new ClassLoggerNoop();
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
  return new ClassLoggerReal<TSpecs>(logSpecs);
}
