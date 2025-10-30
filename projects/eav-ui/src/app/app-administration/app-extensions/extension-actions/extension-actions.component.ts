import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { transient } from 'projects/core/transient';
import { DialogRoutingState } from '../../../edit/dialog/dialogRouteState.model';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { AppExtensionsService } from '../../services/app-extensions.service';
import { Extension } from '../app-extensions.component';

@Component({
  selector: 'app-extension-actions',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './extension-actions.component.html',
})
export class ExtensionActionsComponent {
  // the row data
  ext: Extension;

  router = inject(Router);
  #dialogRouter = transient(DialogRoutingService);
  private extensionsSvc = transient(AppExtensionsService);

  // ag-grid Angular adapter expects agInit to initialize the renderer
  agInit(params: ICellRendererParams): void {
    this.ext = params.data as Extension | undefined;
  }

  openSettings(ext?: Extension) {
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

  updateConfig(ext: Extension) {
    const newConfig = JSON.stringify(ext.configuration ?? {});
    console.log('Updating config for extension:', ext, newConfig);

    this.extensionsSvc.updateExtension(newConfig).subscribe({
      next: () => console.log('Config updated successfully'),
      error: (err) => console.error('Error updating config', err),
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
