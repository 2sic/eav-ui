import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { DialogRoutingState } from '../../edit/dialog/dialogRouteState.model';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { AppExtensionsService } from './app-extensions.service';

export interface Extension {
  folder: string;
  configuration: string;
}

@Component({
  selector: 'app-extensions',
  templateUrl: './app-extensions.component.html',
  styleUrls: ['./app-extensions.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterOutlet,
    MatButtonModule,
  ]
})
export class AppExtensionsComponent {
  router = inject(Router);
  #dialogRouter = transient(DialogRoutingService);
  private extensionsSvc = transient(AppExtensionsService);

  // raw JSON from API
  extensions: Signal<Extension[]> = computed(() => {
    const result = this.extensionsSvc.extensionsResource.value();
    return result?.extensions?.map((ext: Extension) => ({
      folder: ext.folder,
      configuration: JSON.stringify(ext.configuration)
    })) ?? [];
  });

  openSettings() {
    const configurationContentType = 'a0f44af0-6750-40c9-9ad9-4a07b6eda8b3';

    const overrideContents = [{ guid: configurationContentType }];

    // Only pass the relative "new:GUID" subroute
    const subRoute = this.#routeAddItem(configurationContentType);
    const rawUrl = this.#urlTo(`edit/${subRoute}`);

    // normalize leading '#' or '#/' or '/'
    const normalized = rawUrl.replace(/^#\/?/, '').replace(/^\//, '');
    const routeSegments = normalized.split('/').filter(Boolean);

    this.router.navigate(routeSegments, {
      state: {
        returnValue: true,
        overrideContents,
      } satisfies DialogRoutingState,
    });
  }

  #urlTo(subRoute: string): string {
    // Let DialogRoutingService handle the edit subroute
    return `#${this.#dialogRouter.urlSubRoute(subRoute)}`;
  }

  #routeAddItem(configurationContentType: string): string {
    // Only produce "new:GUID" without "edit/"
    return convertFormToUrl({
      items: [EditPrep.newFromType(configurationContentType)],
    } satisfies EditForm);
  }
}