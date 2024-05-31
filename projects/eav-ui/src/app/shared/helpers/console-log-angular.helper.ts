import { environment } from '../../../environments/environment';

/** 
 * Enable logging of different messages.
 * 
 * When needed, add new keys for new "segments"
 */
const enableLogging = {
  always: true, // always active
  dev: false,
  store: false,
  editForm: false,
};

const warningNoLogShown: Record<string, boolean> = {};


/** Log Store changes */
export function consoleLogStore(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal({ segment: 'store', message, data: optionalParams })
}

/** Log Form / Fields / Formulas */
export function consoleLogEditForm(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal({ segment: 'editForm', message, data: optionalParams })
}

/** Log to Dev */
export function consoleLogDev(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal({ segment: 'dev', message, data: optionalParams })
}

/** Log to Dev - always active */
export function consoleLogAlways(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal({ segment: 'always', message, data: optionalParams })
}

/** Log to Dev lightweight (no stack) - always active */
export function logAlways(message?: any, data?: unknown[]): void {
  consoleLogInternal({ segment: 'always', message, callStack: false, data: data })
}



function consoleLogInternal(
  { segment, message, callStack, data = [] }
  : { segment: keyof typeof enableLogging; message?: any; callStack?: boolean, data?: any[]; }
): void {
  // Skip on production
  if (environment.production) return;

  // Check if we've already logged a lot to then stop logging
  const segmentUpper = `[${segment?.toUpperCase()}]`;
  if (!enableLogging[segment])  {
    if (warningNoLogShown[segment]) return;
    console.log(`${segmentUpper}-logging disabled, no further messages will show for this segment.`)
    warningNoLogShown[segment] = true;
    return;
  }

  // Make prefix uppercase if not always
  const prefix = segment === 'always' ? '' : segmentUpper;
  
  // New lightweight log, without the entire trace / call stack
  if (callStack == false) {
    if (!data || data.length === 0) {
      console.log(`${prefix} ${message}`)
      return;
    }

    if (data.length === 1) {
      const show = data[0]
      const len = (typeof(show) === 'string') ? `:${show.length}` : '';
      console.log(`${prefix} ${message} [${typeof(show)}${len}]`, show);
      return;
    }
    
    console.log(`n ${prefix} ${message}`, ...data);
    return;
  }

  console.groupCollapsed(`${prefix} ${message}`, ...data);
  
  // tslint:disable-next-line:no-console
  console.trace();
  console.groupEnd();
}


// old call, should be replaced by more specific calls to enable/disable as needed

/** Console log that doesn't show in Angular production mode */
// export function consoleLogAngular(message?: any, ...optionalParams: any[]) {
//   if (environment.production) { return; }

//   console.groupCollapsed(message, ...optionalParams);
//   // tslint:disable-next-line:no-console
//   console.trace();
//   console.groupEnd();
// }