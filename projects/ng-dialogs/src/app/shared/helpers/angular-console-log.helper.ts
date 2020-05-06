import { environment } from '../../../environments/environment';

export function angularConsoleLog(message?: any, ...optionalParams: any[]) {
  if (environment.production) { return; }

  console.groupCollapsed(message, ...optionalParams);
  // tslint:disable-next-line:no-console
  console.trace();
  console.groupEnd();
}
