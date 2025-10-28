import { ColDef, GridOptions } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { AppExtensionsService } from './app-extensions.service';
import { ExtensionActionsComponent } from './extension-actions/extension-actions.component';

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
    SxcGridModule,
    DragAndDropDirective,
  ]
})
export class AppExtensionsComponent {
  private extensionsSvc = transient(AppExtensionsService);
  
  router = inject(Router);
  #dialogRouter = transient(DialogRoutingService);

  // raw JSON from API
  extensions: Signal<Extension[]> = computed(() => {
    const result = this.extensionsSvc.extensionsResource.value();
    return result?.extensions?.map((ext: Extension) => ({
      folder: ext.folder,
      configuration: JSON.stringify(ext.configuration)
    })) ?? [];
  });
  
  filesDropped(files: File[]) {
    this.extensionsSvc.uploadExtensions(files);
  }

  urlToUploadExtension() {
    return this.#urlTo('import');
  }
  
  #urlTo(subRoute: string): string {
    // Let DialogRoutingService handle the edit subroute
    return `#${this.#dialogRouter.urlSubRoute(subRoute)}`;
  }

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: this.#buildColumnDefs(),
  };

  #buildColumnDefs(): ColDef[] {
    return [
      {
        headerName: 'Folder',
        field: 'folder',
        flex: 1,
        sortable: true,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Configuration',
        field: 'configuration',
        flex: 2,
        sortable: true,
        filter: 'agTextColumnFilter',
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: '',
        width: 50,
        pinned: 'right',
        cellRenderer: ExtensionActionsComponent,
      },
    ];
  }
}