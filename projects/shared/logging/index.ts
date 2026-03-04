/*
 * Internal API Surface of logging.
 *
 * Please make sure you only use this index file for imports in typescripts outside of this folder.
 * This is just for consistency.
 */

export { ClassLogger } from './class/class-logger';
export { FnLogger } from './fn/fn-logger.interface';
export * from './logging';

export const commonSpecs = {
  all: false,
  constructor: false,
};