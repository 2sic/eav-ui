declare const __PRODUCTION__: boolean; // set by the definePlugin with string-replace

export function webpackConsoleLog(message?: any, ...optionalParams: any[]) {
  if (__PRODUCTION__) { return; }

  console.groupCollapsed(message, ...optionalParams);
  // tslint:disable-next-line:no-console
  console.trace();
  console.groupEnd();
}
