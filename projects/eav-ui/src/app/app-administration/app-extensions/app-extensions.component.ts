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
import { AppExtensionsLinkCellComponent } from './app-extensions-link-cell.component';
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

  #extensionsRaw = this.extensionsSvc.getAllLive(this.refresh).value;
  extensions = computed(() => this.#extensionsRaw()?.extensions ?? []);

  // minimal state like license-info: hold the pending folder so the single handler can operate
  #pendingFolder: string | null = null;

  ngOnInit() {
    // register once
    this.#dialogRouter.doOnDialogClosedWithData((data) => {
      if (data?.objData && this.#pendingFolder) {
        const folder = this.#pendingFolder;
        this.#pendingFolder = null;
        this.extensionsSvc.updateExtension(folder, JSON.stringify(data.objData)).subscribe(() => {
          this.fetchExtensions();
        });
      }
    });
  }

  #openSettings(ext?: Extension) {
    const configurationContentType = 'a0f44af0-6750-40c9-9ad9-4a07b6eda8b3';
    // Build overrideContents for existing configuration or new
    const overrideContents: Record<string, unknown>[] = ext?.configuration?.nameId
      ? [{
        guid: ext.configuration.nameId,           // Use GUID as identifier
        ...ext.configuration                     // spread existing configuration data
      }]
      : [{ guid: configurationContentType }];      // fallback for new configuration

    const subRoute = this.#routeAddItem(configurationContentType);
    const rawUrl = this.#urlTo(`edit/${subRoute}`);
    const normalized = rawUrl.replace(/^#\/?/, '').replace(/^\//, '');
    const routeSegments = normalized.split('/').filter(Boolean);

    // set token before navigation
    this.#pendingFolder = ext?.folder ?? null;

    this.router.navigate(routeSegments, {
      state: {
        returnValue: true,
        overrideContents
      } satisfies DialogRoutingState,
    });
  }

  #downloadExtension(ext: Extension) {
    this.extensionsSvc.downloadExtension(ext.folder);
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
    rowHeight: 80,
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

  cellTextRenderer(text: string, subText?: string, width?: string): string {
    return `
      <div style="display: flex; flex-direction: column;">
        <span title="${text}" style="font-weight:bold; white-space: nowrap; width: ${width ?? '100%'}; overflow: hidden; text-overflow: ellipsis;">${text}</span>
        <span title="${subText}" style="margin-top: -15px; white-space: nowrap; width: ${width ?? '100%'}; overflow: hidden; text-overflow: ellipsis;">
          ${subText ?? ''}
        </span>
      </div>
    `;
  }

  #buildColumnDefs(): ColDef[] {
    return [
      {
        headerName: 'Extension',
        field: 'folder',
        flex: 1,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { data: Extension }) => {
          const folder = params.data?.folder ?? '';
          const guid = params.data?.configuration?.nameId ?? '';
          return this.cellTextRenderer(folder, guid.toString());
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        flex: 1,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { data: Extension }) => {
          const name = params.data?.configuration?.name ?? '';
          const teaser = params.data?.configuration?.teaser ?? '';
          return this.cellTextRenderer(name, teaser);
        },
      },
      {
        headerName: 'Creator',
        field: 'creator',
        maxWidth: 175,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { data: Extension }) => {
          const creator = params.data?.configuration?.createdBy ?? '';
          const copyright = params.data?.configuration?.copyright ?? '';
          return this.cellTextRenderer(creator, copyright, '150px');
        },
      },
      {
        headerName: 'Links',
        field: 'link',
        width: 125,
        cellRenderer: AppExtensionsLinkCellComponent,
        cellRendererParams: (params: { data: Extension }) => ({
          mainLink: params.data?.configuration?.linkMain ?? undefined,
          docsLink: params.data?.configuration?.linkDocs ?? undefined,
          demosLink: params.data?.configuration?.linkDemo ?? undefined,
          sourceCodeLink: params.data?.configuration?.linkSource ?? undefined,
        }),
      },
      {
        headerName: 'Actions',
        width: 100,
        pinned: 'right',
        cellRenderer: ExtensionActionsComponent,
        cellRendererParams: (() => {
          const params: ExtensionActionsParams = {
            urlTo: (verb, ext) => '#' + this.#urlTo(ext.folder),
            do: (verb, ext) => {
              switch (verb) {
                case 'edit': this.#openSettings(ext); break;
                case 'download': this.#downloadExtension(ext); break;
              }
            }
          } satisfies ExtensionActionsParams;
          return params;
        })(),
      },
    ];
  }
}