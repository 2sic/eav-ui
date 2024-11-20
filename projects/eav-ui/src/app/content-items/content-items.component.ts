import { ColDef, GridApi, GridOptions, GridReadyEvent, ValueGetterParams } from '@ag-grid-community/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, filter, take } from 'rxjs';
import { transient } from '../../../../core';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { GoToMetadata } from '../metadata';
import { AgGridHelper } from '../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { BooleanFilterComponent } from '../shared/components/boolean-filter/boolean-filter.component';
import { EntityFilterComponent } from '../shared/components/entity-filter/entity-filter.component';
import { FileUploadDialogData } from '../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { keyFilters } from '../shared/constants/session.constants';
import { DragAndDropDirective } from '../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { ToggleDebugDirective } from '../shared/directives/toggle-debug.directive';
import { DataTypeCatalog } from '../shared/fields/data-type-catalog';
import { Field } from '../shared/fields/field.model';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { classLog } from '../shared/logging';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { SafeHtmlPipe } from '../shared/pipes/safe-html.pipe';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { EntityEditService } from '../shared/services/entity-edit.service';
import { GlobalConfigService } from '../shared/services/global-config.service';
import { computedObj } from '../shared/signals/signal.utilities';
import { ContentItemsActionsComponent } from './content-items-actions/content-items-actions.component';
import { ContentItemsActionsParams } from './content-items-actions/content-items-actions.models';
import { ContentItemsEntityComponent } from './content-items-entity/content-items-entity.component';
import { ContentItemsStatusComponent } from './content-items-status/content-items-status.component';
import { buildFilterModel } from './content-items.helpers';
import { CreateMetadataDialogComponent } from './create-metadata-dialog/create-metadata-dialog.component';
import { MetadataInfo } from './create-metadata-dialog/create-metadata-dialog.models';
import { AgGridFilterModel } from './models/ag-grid-filter.model';
import { ContentItem } from './models/content-item.model';
import { ExtendedColDef } from './models/extended-col-def.model';
import { PubMetaFilterComponent } from './pub-meta-filter/pub-meta-filter.component';
import { PubMeta } from './pub-meta-filter/pub-meta-filter.model';
import { ContentItemsService } from './services/content-items.service';

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatDialogActions,
    SafeHtmlPipe,
    DragAndDropDirective,
    ToggleDebugDirective,
    SxcGridModule,
    TippyDirective,
  ],
})
export class ContentItemsComponent implements OnInit, OnDestroy {

  log = classLog({ ContentItemsComponent });

  isDebug = inject(GlobalConfigService).isDebug;

  #entitiesSvc = transient(EntityEditService);
  #contentExportSvc = transient(ContentExportService);
  #contentItemsSvc = transient(ContentItemsService);
  #contentTypesSvc = transient(ContentTypesService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<ContentItemsComponent>,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    onFilterChanged: _ => this.#filterChanged.update(v => v + 1),
  };

  /** Signal to tell other signals that the filter changed */
  #filterChanged = signal(0);

  // TODO: @2pp this subject can probably be replaced with a signal
  // + an effect (in the constructor) for the one case where it has a .pipe(...)
  #gridApi$ = new BehaviorSubject<GridApi<ContentItem>>(null);
  #gridApiSigTemp = toSignal(this.#gridApi$);

  #contentTypeStaticName = this.#dialogRouter.getParam('contentTypeStaticName');
  contentType = this.#contentTypesSvc.retrieveContentTypeSig(this.#contentTypeStaticName, undefined);

  #refresh = signal(0);

  items = computed(() => {
    const refresh = this.#refresh();
    return this.#contentItemsSvc.getAllSig(this.#contentTypeStaticName, undefined);
  });

  ngOnInit() {
    this.fetchColumns();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchItems());
  }

  ngOnDestroy() {
    this.#gridApi$.complete();
  }

  closeDialog() {
    this.dialog.close();
  }

  onGridReady(params: GridReadyEvent) {
    this.#gridApi$.next(params.api);
    this.urlToExportContent();
  }

  private fetchItems() {
    this.#refresh.update(value => value + 1)
  }

  private fetchColumns() {
    this.#contentItemsSvc.getColumns(this.#contentTypeStaticName).subscribe(columns => {
      // filter out ephemeral columns as they don't have data to show
      const columnsWithoutEphemeral = columns.filter(column => !column.IsEphemeral);
      const columnDefs = this.#buildColumnDefs(columnsWithoutEphemeral);
      const filterModel = buildFilterModel(sessionStorage.getItem(keyFilters), columnDefs);
      if (this.#gridApi$.value) {
        this.setColumnDefs(columnDefs, filterModel);
      } else {
        this.#gridApi$.pipe(
          filter(gridApi => gridApi != null), // firefox does web requests faster than drawing grid and getting gridApi
          take(1),
        ).subscribe(gridApi => {
          this.setColumnDefs(columnDefs, filterModel);
        });
      }
    });
  }

  private setColumnDefs(columnDefs: ColDef[], filterModel: AgGridFilterModel) {
    this.#gridApi$.value.setColumnDefs(columnDefs);
    if (filterModel) {
      this.log.a('Will try to apply filter:', filterModel);
      this.#gridApi$.value.setFilterModel(filterModel);
    }
  }

  // This method is called multiple times, to reduce redundancy.
  // It calls the urlSubRoute method from the dialogRouter service
  // and sets a # infront of the url, so angular can differentiate
  // angular routes from ordinary urls.
  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  #urlToMetadata(item: ContentItem) {
    return this.#dialogRouter.urlSubRoute(GoToMetadata.getUrlEntity(
      item.Guid,
      `Metadata for Entity: ${item._Title} (${item.Id})`,
      this.#contentTypeStaticName,
    ));
  }

  editItem(item?: ContentItem) {
    const form: EditForm = {
      items: [
        item == null
          ? EditPrep.newFromType(this.#contentTypeStaticName)
          : EditPrep.editId(item.Id)
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navRelative([`edit/${formUrl}`]);
  }

  #urlToOpenEditView(item?: ContentItem) {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          item == null
            ? EditPrep.newFromType(this.#contentTypeStaticName)
            : EditPrep.editId(item.Id)
        ]
      })}`
    )
  }

  urlToNewItem(item?: ContentItem) {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          item == null
            ? EditPrep.newFromType(this.#contentTypeStaticName)
            : EditPrep.editId(item.Id)
        ],
      })}`
    );
  }

  urlToExportContent = computedObj('urlToExportContent', () => {
    const value = this.#gridApiSigTemp();
    if (!value)
      return '';

    // Watch for filter changes, as the IDs are probably different on each change
    this.#filterChanged();

    const hasFilters = Object.keys(value.getFilterModel()).length > 0;
    const ids: number[] = [];

    if (hasFilters)
      value.forEachNodeAfterFilterAndSort(n => ids.push(n.data.Id));

    return this.#urlTo(
      `export/${this.#contentTypeStaticName}${ids.length > 0 ? `/${ids.join(',')}` : ''}`
    );
  });

  filesDropped(files: File[]) {
    const importFile = files[0];
    const ext = importFile.name.substring(importFile.name.lastIndexOf('.') + 1).toLocaleLowerCase();
    switch (ext) {
      case 'xml':
        this.urlToImportContent(files);
        break;
      case 'json':
        this.importItem(files);
        break;
    }
  }

  urlToImportContent(files?: File[]) {
    // Special, because the /import is at the end of the URL
    // is a TODO: @2pp, but maybe needs some more work (might be used from diff places)
    // It's also fishy, that the URL contains the GUID twice
    return this.#urlTo(
      `${this.#contentTypeStaticName}${files ? `/${files.map(f => f.name).join(',')}` : ''}/import`
    );
  }

  // TODO: Should be a link, but is tricky to do with the current setup
  // as it's doing somethingwith the files, which is not possible with a link
  importItem(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navRelative(['import'], { state: dialogData });
  }

  urlToImportItem() {
    return this.#urlTo('import');
  }

  createMetadata() {
    const metadataDialogRef = this.matDialog.open(CreateMetadataDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    metadataDialogRef.afterClosed().subscribe((itemFor: MetadataInfo) => {
      if (itemFor == null) return;

      const form: EditForm = {
        items: [EditPrep.newMetadataFromInfo(this.#contentTypeStaticName, itemFor)],
      };
      const formUrl = convertFormToUrl(form);
      this.#dialogRouter.navRelative([`edit/${formUrl}`]);
      this.changeDetectorRef.markForCheck();
    });
  }

  debugFilter() {
    console.warn('Current filter:', this.#gridApi$.value.getFilterModel());
    this.snackBar.open('Check console for filter information', undefined, { duration: 3000 });
  }

  #buildColumnDefs(columns: Field[]) {
    const columnDefs: ColDef[] = [
      {
        ...ColumnDefinitions.IdWithDefaultRenderer,
        cellClass: (p: { data: ContentItem }) => `id-action no-padding no-outline ${p.data._EditInfo.ReadOnly ? 'disabled' : ''}`.split(' '),
        cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<ContentItem>()
      },
      {
        field: 'Status',
        width: 82,
        headerClass: 'dense',
        cellClass: 'secondary-action no-padding'.split(' '),
        filter: PubMetaFilterComponent,
        valueGetter: (p) => {
          const item: ContentItem = p.data;
          const published: PubMeta = {
            published: item.IsPublished,
            metadata: !!item.For,
            hasMetadata: item.Metadata ? item.Metadata.length > 0 : false,
          };
          return published;
        },
        cellRenderer: ContentItemsStatusComponent,
        cellRendererParams: (() => ({
          urlTo: (verb, item) => '#' + this.#urlToMetadata(item),
        } satisfies ContentItemsStatusComponent['params']))(),
      },
      {
        ...ColumnDefinitions.TextWidePrimary,
        headerName: 'Item (Entity)',
        field: '_Title',
        flex: 2,
        cellRenderer: (p: { data: ContentItem, }) => AgGridHelper.cellLink(this.#urlToOpenEditView(p.data), p.data.Title),
      },
      {
        headerName: 'Stats',
        headerTooltip: 'Used by others / uses others',
        field: '_Used',
        width: 70,
        headerClass: 'dense',
        cellClass: 'no-outline',
        sortable: true,
        filter: 'agTextColumnFilter',
        valueGetter: (p: { data: ContentItem }) => `${p.data._Used} / ${p.data._Uses}`,
      },
      {
        ...ColumnDefinitions.ActionsPinnedRight3,
        cellRenderer: ContentItemsActionsComponent,
        cellRendererParams: (() => {
          const params: ContentItemsActionsParams = {
            urlTo: (verb, item) => '#' + this.#urlToClone(item),
            do: (verb, item) => {
              switch (verb) {
                case 'export': this.export(item); break;
                case 'delete': this.delete(item); break;
              }
            }
          } satisfies ContentItemsActionsParams;
          return params;
        })(),
      },
    ];
    for (const column of columns) {
      const colDef: ExtendedColDef = {
        headerName: column.StaticName,
        field: column.StaticName,
        flex: 2,
        minWidth: 250,
        cellClass: 'no-outline',
        sortable: true,
      };
      switch (column.Type) {
        case DataTypeCatalog.Entity:
          colDef.allowMultiValue = column.Metadata?.Entity?.AllowMultiValue ?? true;
          colDef.cellRenderer = ContentItemsEntityComponent;
          colDef.valueGetter = this.valueGetterEntityField;
          colDef.filter = EntityFilterComponent;
          break;
        case DataTypeCatalog.DateTime:
          colDef.useTimePicker = column.Metadata?.DateTime?.UseTimePicker ?? false;
          colDef.valueGetter = this.valueGetterDateTime;
          colDef.filter = 'agTextColumnFilter';
          break;
        case DataTypeCatalog.Boolean:
          colDef.valueGetter = this.valueGetterBoolean;
          colDef.filter = BooleanFilterComponent;
          break;
        case DataTypeCatalog.Number:
          colDef.filter = 'agNumberColumnFilter';
          break;
        default:
          colDef.filter = 'agTextColumnFilter';
          break;
      }
      columnDefs.push(colDef);
    }
    return columnDefs;
  }

  #urlToClone(item: ContentItem) {
    return this.#dialogRouter.urlSubRoute(
      `edit/${convertFormToUrl({
        items: [EditPrep.copy(this.#contentTypeStaticName, item.Id)],
      })}`
    );
  }

  private export(item: ContentItem) {
    this.#contentExportSvc.exportEntity(item.Id, this.#contentTypeStaticName, true);
  }

  private delete(item: ContentItem) {
    if (!confirm(`Delete '${item._Title}' (${item._RepositoryId})?`)) return;
    this.snackBar.open('Deleting...');
    this.#entitiesSvc.delete(this.#contentTypeStaticName, item._RepositoryId, false).subscribe({
      next: () => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.fetchItems();
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(`${err.error.ExceptionMessage}\n\nDo you want to force delete '${item._Title}' (${item._RepositoryId})?`)) {
          return;
        }
        this.snackBar.open('Deleting...');
        this.#entitiesSvc.delete(this.#contentTypeStaticName, item._RepositoryId, true).subscribe(() => {
          this.snackBar.open('Deleted', null, { duration: 2000 });
          this.fetchItems();
        });
      }
    });
  }

  private valueGetterEntityField(params: ValueGetterParams) {
    const rawValue: ContentItem[] = params.data[params.colDef.field];
    if (rawValue.length === 0) { return null; }
    return rawValue.map(item => item.Title);
  }

  private valueGetterDateTime(params: ValueGetterParams) {
    const rawValue: string = params.data[params.colDef.field];
    if (!rawValue) { return null; }
    return (params.colDef as ExtendedColDef).useTimePicker
      ? rawValue.replace('T', ' ').replace('Z', '')
      : rawValue.split('T')[0];
  }

  private valueGetterBoolean(params: ValueGetterParams) {
    const rawValue = params.data[params.colDef.field];
    if (typeof rawValue !== 'boolean') { return null; }
    return rawValue.toString();
  }
}
