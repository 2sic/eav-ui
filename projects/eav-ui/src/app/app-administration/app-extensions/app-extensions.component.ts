import { ColDef, GridOptions } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
  styleUrls: ['./app-extensions.component.scss'],
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

  // reactive data from httpResource
  extensions = computed(() => this.extensionsSvc.extensions());

  refresh = signal<number>(0);

  filesDropped(files: File[]) {
    this.extensionsSvc.uploadExtensions(files).subscribe(() => this.refresh.update(v => v + 1));
  }

  urlToUploadExtension() {
    return this.#urlTo('import');
  }

  #urlTo(subRoute: string): string {
    return `#${this.#dialogRouter.urlSubRoute(subRoute)}`;
  }

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: this.#buildColumnDefs(),
  };

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
  });

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
        autoHeight: true,
        wrapText: true,
        valueGetter: (params) =>
          JSON.stringify(params.data.configuration, null, 2)
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
