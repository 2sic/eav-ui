import { ColDef, GridOptions } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { GridWithHelpComponent, HelpTextConst } from '../../shared/ag-grid/grid-with-help/grid-with-help.component';
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
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogActions,
    RouterOutlet,
    MatButtonModule,
    SxcGridModule,
    DragAndDropDirective,
    GridWithHelpComponent,
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

  refresh = signal<number>(0);
  
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

  // UI Help Text for the UX Help Info Card
  #helpTextConst: HelpTextConst = {
    empty: {
      description: '<p><b>App Extensions</b><br>Install extensions to add extra functionality or input types to apps.</p>',
      hint: '<p>Create an extension by placing an <code>extension.json</code> file in the <code>app/extensions</code> folder.</p>'
    },
    content: {
      description: '<p><b>App Extensions</b><br>Installed extensions are shown here.</p>',
      hint: '<p>Use the Upload button to add an extension folder.</p>'
    }
  };

  uxHelpText = computed(() => {
    const data = this.extensions();
    return data?.length === 0 ? this.#helpTextConst.empty : this.#helpTextConst.content;
  })

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