import { environment } from '../../../environments/environment';

/** Console log that doesn't show in Angular production mode */
export function consoleLogAngular(message?: any, ...optionalParams: any[]) {
  if (environment.production) { return; }

  console.groupCollapsed(message, ...optionalParams);
  // tslint:disable-next-line:no-console
  console.trace();
  console.groupEnd();
}
