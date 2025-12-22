import appExtensionMask from '!raw-loader!./app-extension-mask.svg';
import { ColDef, GridOptions } from '@ag-grid-community/core';

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { of, take } from 'rxjs';
import { transient } from '../../../../../core';
import { DialogRoutingState } from '../../edit/dialog/dialogRouteState.model';
import { GridWithHelpComponent, HelpTextConst } from '../../shared/ag-grid/grid-with-help/grid-with-help';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { EntityService } from '../../shared/services/entity.service';
import { Extension } from '../models/extension.model';
import { AppExtensionsService } from '../services/app-extensions.service';
import { ImportExtensionComponent } from '../sub-dialogs/import-extension/import-extension';
import { AppExtensionActions } from './extension-actions/extension-actions';
import { AppExtensionsLinkCell } from './extensions-link/extensions-link';
@Component({
  selector: 'app-extensions',
  templateUrl: './app-extensions.html',
  styleUrls: ['./app-extensions.scss'],
  imports: [
    MatIconModule,
    MatDialogActions,
    RouterOutlet,
    MatButtonModule,
    SxcGridModule,
    DragAndDropDirective,
    GridWithHelpComponent,
    TippyDirective
  ]
})
export class AppExtensions implements OnInit {
  private extensionsSvc = transient(AppExtensionsService);
  private router = inject(Router);
  #dialogRouter = transient(DialogRoutingService);
  private dialog = transient(MatDialog);
  private entitySvc = transient(EntityService);

  fabOpen = signal(false);

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
        this.extensionsSvc.updateConfiguration(folder, JSON.stringify(data.objData)).subscribe(() => {
          this.fetchExtensions();
        });
      } else {
        this.fetchExtensions();
      }
    });
  }

  openChange(open: boolean): void {
    this.fabOpen.set(open);
  }

  browseCatalog(): void {
    window.open('https://2sxc.org/apps', '_blank');
  }

  importExtension(files?: File[]): void {
    const rawUrl = this.#urlTo('import')
    const normalized = rawUrl.replace(/^#\/?/, '').replace(/^\//, '')
    const routeSegments = normalized.split('/').filter(Boolean)

    this.router.navigate(routeSegments, {
      state: {
        returnValue: true,
      } satisfies DialogRoutingState,
    });
  }

  #openSettings(ext?: Extension) {
    const configurationContentType = 'a0f44af0-6750-40c9-9ad9-4a07b6eda8b3';
    // Build overrideContents for existing configuration or new
    const overrideContents: Record<string, unknown>[] = [{ ...(ext?.configuration ?? {}) }];

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

  #openEditContentType(contentType: string) {
    if (!contentType) return;

    this.entitySvc.getEntities$(of({ contentTypeName: contentType })).subscribe(entities => {
      const subRoute = entities ? entities[0].Id : this.#routeAddItem(contentType) // edit first or create new
      const rawUrl = this.#urlTo(`edit/${subRoute}`)
      const normalized = rawUrl.replace(/^#\/?/, '').replace(/^\//, '')
      const routeSegments = normalized.split('/').filter(Boolean)
      this.router.navigate(routeSegments, {
        state: {
          returnValue: true,
          // overrideContents
        } satisfies DialogRoutingState,
      });
    });
  }

  #openInspection(extensionFolder: string, edition?: string) {
    const url = this.#urlTo('inspect/' + extensionFolder);
    const normalized = url.replace(/^#\/?/, '').replace(/^\//, '');
    const routeSegments = normalized.split('/').filter(Boolean);

    this.router.navigate(routeSegments, {
      state: {
        returnValue: true
      } satisfies DialogRoutingState,
      queryParams: edition ? { edition } : undefined
    });
  }

  #deleteExtension(extensionFolder: string, edition?: string) {
    const url = this.#urlTo('delete/' + extensionFolder);
    const normalized = url.replace(/^#\/?/, '').replace(/^\//, '');
    const routeSegments = normalized.split('/').filter(Boolean);

    this.router.navigate(routeSegments, {
      state: {
        returnValue: true
      } satisfies DialogRoutingState,
      queryParams: edition ? { edition } : undefined
    });
  }

  filesDropped(files: File[]) {
    const dialogRef = this.dialog.open(ImportExtensionComponent, {
      data: {
        file: files[0],
        allowedFileTypes: 'zip',
        multiple: true,
        title: 'Import Extension',
        description: 'Select Extension folder from your computer to import.',
        upload$: (selectedFile: File) => this.extensionsSvc.uploadExtensions(selectedFile)
      },
    });

    // Refresh extensions list after dialog closes if installation was successful
    dialogRef.afterClosed().pipe(take(1)).subscribe((refresh) => {
      if (refresh) {
        this.fetchExtensions();
      }
    });
  }

  private fetchExtensions() {
    this.refresh.update(v => ++v);
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

  /**
   * Multi-line cell renderer to show a bold main text with optional subtext and something before (probably an icon).
   * @param text 
   * @param subText 
   * @param width 
   * @param introHtml 
   * @returns 
   */
  cellTextRenderer(text: string, subText?: string, width?: string, introHtml?: string): string {
    text = text || '';
    subText = subText || '';
    width = width || '100%';

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        ${introHtml ?? ''}
        <div style="display: flex; flex-direction: column;">
          <span title="${text}" style="font-weight:bold; white-space: nowrap; width: ${width}; overflow: hidden; text-overflow: ellipsis;">${text}</span>
          <span title="${subText}" style="margin-top: -15px; white-space: nowrap; width: ${width}; overflow: hidden; text-overflow: ellipsis;">
            ${subText ?? ''}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Special cell renderer to show text with optional subtext and icon.
   * The icon uses the svg file as mask to ensure consistent styling.
   */
  iconAndTitleCellRenderer(text: string, subText?: string, width?: string, icon?: string): string {
    const iconSize = 48; // in px
    const iconHtml = icon
      ? `<img src="${icon}" alt="${text}" style="mask-image: url('data:image/svg+xml;utf8,${encodeURIComponent(appExtensionMask)}'); width:${iconSize}px; height:${iconSize}px;">`
      : `<div style="flex:0 0 ${iconSize}px; height:${iconSize}px;"></div>` // Placeholder for alignment;
    return this.cellTextRenderer(text, subText, width, iconHtml);
  }

  #buildColumnDefs(): ColDef[] {
    return [
      {
        headerName: 'Extension',
        field: 'folder',
        flex: 1,
        sortable: true,
        sort: 'asc',
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { data: Extension }) => {
          const d = params.data;
          return this.iconAndTitleCellRenderer(d?.folder, d?.configuration?.nameId?.toString(), undefined, d?.icon);
        },
      },
      {
        headerName: 'Name',
        field: 'configuration.name',
        sortable: true,
        filter: 'agTextColumnFilter',
        flex: 1,
        cellRenderer: (params: { data: Extension }) => {
          const c = params.data?.configuration;
          return this.cellTextRenderer(c?.name, c?.teaser);
        },
      },
      {
        headerName: 'Edition',
        field: 'edition',
        sortable: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { data: Extension }) => {
          const c = params.data;
          return this.cellTextRenderer(c?.edition || 'Default');
        },
      },
      {
        headerName: 'Creator',
        field: 'configuration.createdBy',
        maxWidth: 175,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: { data: Extension }) => {
          const c = params.data?.configuration;
          return this.cellTextRenderer(c?.createdBy, c?.copyright, '150px');
        },
      },
      {
        headerName: 'Links',
        sortable: false,
        field: 'configuration.link',
        width: 125,
        cellRenderer: AppExtensionsLinkCell,
        cellRendererParams: (params: { data: Extension }) => ({
          mainLink: params.data?.configuration?.linkMain,
          docsLink: params.data?.configuration?.linkDocs,
          demosLink: params.data?.configuration?.linkDemo,
          sourceCodeLink: params.data?.configuration?.linkSource,
        }),
      },
      {
        headerName: 'Actions',
        width: 150,
        pinned: 'right',
        cellRenderer: AppExtensionActions,
        cellRendererParams: (() => {
          const params: AppExtensionActions['params'] = {
            urlTo: (_, ext) => '#' + this.#urlTo(ext.folder),
            do: (verb, ext) => {
              switch (verb) {
                case 'edit': return this.#openSettings(ext);
                case 'download': return this.extensionsSvc.downloadExtension(ext.folder);
                case 'delete': return this.#deleteExtension(ext.folder, ext.edition);
                case 'inspect': return this.#openInspection(ext.folder, ext.edition);
                case 'openSettings': return this.#openEditContentType(
                  ext.configuration?.settingsContentType
                );
                case 'openResources': return this.#openEditContentType(
                  ext.configuration?.resourcesContentType
                );
              }
            }
          } satisfies AppExtensionActions['params'];
          return params;
        })(),
      },
    ];
  }
}