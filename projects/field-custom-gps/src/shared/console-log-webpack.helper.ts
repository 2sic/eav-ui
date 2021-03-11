declare const __PRODUCTION__: boolean; // set by the definePlugin with string-replace

/** Console log that doesn't show in Webpack production mode */
export function consoleLogWebpack(message?: any, ...optionalParams: any[]) {
  if (__PRODUCTION__) { return; }

  console.groupCollapsed(message, ...optionalParams);
  // tslint:disable-next-line:no-console
  console.trace();
  console.groupEnd();
}
