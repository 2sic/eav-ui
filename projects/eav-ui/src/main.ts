import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from '../../shared/environments/environment';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

if (environment.production)
  enableProdMode();

bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]})
  .catch((err) => console.error(err));
