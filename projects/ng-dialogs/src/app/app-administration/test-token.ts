import { InjectionToken } from '@angular/core';

export const TestToken = new InjectionToken<string>('Any Message');

export function testTokenFactory(APP_INITIALIZER: any): string {
  console.log(10);
  return window.history.state;
}
