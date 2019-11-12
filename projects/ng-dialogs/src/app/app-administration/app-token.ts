import { InjectionToken } from '@angular/core';

export const AppToken = new InjectionToken<string>('Any Message');

export function appTokenFactory(APP_INITIALIZER: any): string {
  console.log(10);
  return window.history.state.appId;
}
