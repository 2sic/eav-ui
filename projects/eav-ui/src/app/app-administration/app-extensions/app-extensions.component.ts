import { ColDef, GridOptions } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { DialogRoutingState } from '../../edit/dialog/dialogRouteState.model';
import { GridWithHelpComponent, HelpTextConst } from '../../shared/ag-grid/grid-with-help/grid-with-help.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Extension } from '../models/extension.model';
import { AppExtensionsService } from '../services/app-extensions.service';
import { ExtensionActionsComponent } from './extension-actions/extension-actions.component';
import { ExtensionActionsParams } from './extension-actions/extension-actions.model';

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
export class AppExtensionsComponent implements OnInit {
  private extensionsSvc = transient(AppExtensionsService);
  router = inject(Router);
  #dialogRouter = transient(DialogRoutingService);

  /** Signal to trigger reloading of data */
  refresh = signal(0);

  // Following the exact pattern from content-items
  #extensionsRaw = this.extensionsSvc.getAllLive(this.refresh).value;

  extensions = computed(() => {
    const data = this.#extensionsRaw();
    return data?.extensions ?? [];
  });

  ngOnInit() {
    // Listen for dialog close events and refresh the grid
    // This will trigger when any dialog (including import) closes
    this.#dialogRouter.doOnDialogClosed(() => this.fetchExtensions());
  }

  #openSettings(ext?: Extension) {
    const configurationContentType = 'a0f44af0-6750-40c9-9ad9-4a07b6eda8b3';
    const overrideContents = [{ guid: configurationContentType }];

    let subRoute: string;
    let form: EditForm;

    // Check if extension has existing configuration
    if (ext?.configuration && ext.configuration.nameId) {
      // For existing configurations, we need to edit by the nameId (GUID)
      // Since configurations might not be regular entities, we create them as new items
      // but prefilled with the existing configuration data
      form = {
        items: [EditPrep.newFromType(configurationContentType, ext.configuration as unknown as Record<string, unknown>)],
      };
      subRoute = convertFormToUrl(form);
    } else
      subRoute = this.#routeAddItem(configurationContentType);

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

    this.#dialogRouter.doOnDialogClosedWithData((data) => {
      if (data?.objData) {
        this.extensionsSvc.updateExtension(ext.folder, JSON.stringify(data.objData)).subscribe(() => {
          this.fetchExtensions();
        });
      }
    });
  }

  filesDropped(files: File[]) {
    this.extensionsSvc.uploadExtensions(files).subscribe(() => this.fetchExtensions());
  }

  private fetchExtensions() {
    this.refresh.update(v => ++v);
  }

  urlToUploadExtension() {
    return this.#urlTo('import');
  }

  #urlTo(subRoute: string): string {
    return `#${this.#dialogRouter.urlSubRoute(subRoute)}`;
  }

  #routeAddItem(configurationContentType: string): string {
    // Only produce "new:GUID" without "edit/"
    return convertFormToUrl({
      items: [EditPrep.newFromType(configurationContentType)],
    } satisfies EditForm);
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
        cellRendererParams: (() => {
          const params: ExtensionActionsParams = {
            urlTo: (verb, ext) => '#' + this.#urlTo(ext.folder),
            do: (verb, ext) => {
              switch (verb) {
                case 'edit': this.#openSettings(ext); break;
              }
            }
          } satisfies ExtensionActionsParams;
          return params;
        })(),
      },
    ];
  }
}