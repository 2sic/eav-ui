import { EnvironmentInjector, Injector } from '@angular/core';

export interface InjectorBundle {
  injector: Injector;
  environmentInjector: EnvironmentInjector;
}
