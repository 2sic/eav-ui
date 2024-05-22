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
  consoleLogInternal('store', message, optionalParams)
}

/** Log Form / Fields / Formulas */
export function consoleLogEditForm(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal('editForm', message, optionalParams)
}

/** Log to Dev */
export function consoleLogDev(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal('dev', message, optionalParams)
}

/** Log to Dev - always active */
export function consoleLogAlways(message?: any, ...optionalParams: any[]): void {
  consoleLogInternal('always', message, optionalParams)
}


function consoleLogInternal(segment: keyof typeof enableLogging, message?: any, ...optionalParams: any[]): void {
  const segmentUpper = `[${segment?.toUpperCase()}]`;
  if (!enableLogging[segment])  {
    if (warningNoLogShown[segment]) return;
    console.log(`${segmentUpper}-logging disabled, no further messages will show for this segment.`)
    warningNoLogShown[segment] = true;
    return;
  }

  if (environment.production) return;

  const prefix = segment === 'always' ? '' : segmentUpper;
  
  console.groupCollapsed(`${prefix} ${message}`, ...optionalParams);
  
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