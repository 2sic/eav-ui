import { ColDef, GridApi, GridOptions, GridReadyEvent, ValueGetterParams } from '@ag-grid-community/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal, ViewContainerRef, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../core';
import { GoToRecycleBin } from '../app-administration/recycle-bin/go-to-recycle-bin';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ConfirmDeleteDialogComponent } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ConfirmDeleteDialogData } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { ContentExportService } from '../content-export/services/content-export.service';
import { GoToMetadata } from '../metadata';
import { AgGridHelper } from '../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { GridWithHelpComponent, HelpTextConst } from '../shared/ag-grid/grid-with-help/grid-with-help';
import { BooleanFilterComponent } from '../shared/components/boolean-filter/boolean-filter';
import { EntityFilterComponent } from '../shared/components/entity-filter/entity-filter';
import { FileUploadDialogData } from '../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { keyFilters } from '../shared/constants/session.constants';
import { DialogHeaderComponent } from "../shared/dialog-header/dialog-header";
import { DragAndDropDirective } from '../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { ToggleDebugDirective } from '../shared/directives/toggle-debug.directive';
import { DataTypeCatalog } from '../shared/fields/data-type-catalog';
import { Field } from '../shared/fields/field.model';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { classLog } from '../shared/logging';
import { EditForm } from '../shared/models/edit-form.model';
import { ItemIdHelper } from '../shared/models/item-id-helper';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { SafeHtmlPipe } from '../shared/pipes/safe-html.pipe';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { RouteLinkHelper } from '../shared/routing/route-link-helper';
import { Context } from '../shared/services/context';
import { EntityEditService } from '../shared/services/entity-edit.service';
import { GlobalConfigService } from '../shared/services/global-config.service';
import { computedObj } from '../shared/signals/signal.utilities';
import { ContentItemsActionsComponent } from './content-items-actions/content-items-actions';
import { ContentItemsActionsParams } from './content-items-actions/content-items-actions.models';
import { ContentItemsEntityComponent } from './content-items-entity/content-items-entity';
import { ContentItemsStatusComponent } from './content-items-status/content-items-status';
import { buildFilterModel } from './content-items.helpers';
import { CreateMetadataDialogComponent } from './create-metadata-dialog/create-metadata-dialog';
import { MetadataInfo } from './create-metadata-dialog/create-metadata-dialog.models';
import { AgGridFilterModel } from './models/ag-grid-filter.model';
import { ContentItem } from './models/content-item.model';
import { ExtendedColDef } from './models/extended-col-def.model';
import { PubMetaFilterComponent } from './pub-meta-filter/pub-meta-filter';
import { PubMeta } from './pub-meta-filter/pub-meta-filter.model';
import { ContentItemsService } from './services/content-items.service';

const logSpecs = {
  all: false,
  items: true,
}

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.html',
  styleUrls: ['./content-items.scss'],
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
    GridWithHelpComponent,
    DialogHeaderComponent,
]
})
export class ContentItemsComponent implements OnInit {

  log = classLog({ ContentItemsComponent }, logSpecs);

  isDebug = inject(GlobalConfigService).isDebug;
  #snackBar = inject(MatSnackBar);
  #matDialog = inject(MatDialog);
  #viewContainerRef = inject(ViewContainerRef);
  #changeDetectorRef = inject(ChangeDetectorRef);
  #dialog = inject(MatDialogRef<ContentItemsComponent>);
  #context = inject(Context);

  #entitiesSvc = transient(EntityEditService);
  #contentExportSvc = transient(ContentExportService);
  #contentItemsSvc = transient(ContentItemsService);
  #contentTypesSvc = transient(ContentTypesService);
  #dialogRouter = transient(DialogRoutingService);

  constructor() {
    effect(() => {
      const data = this.items(); // re-runs when items are refreshed
      if (data)
        this.#gridApiSig().setGridOption("loading", false);
    });
  }

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    onFilterChanged: _ => this.#filterChanged.update(v => v + 1),
  };

  /** Signal to tell other signals that the filter changed */
  #filterChanged = signal(0);

  /** Signal to trigger reloading of data */
  refresh = signal(0);

  // UI Help Text for the UX Help Info Card
  #helpTextConst: HelpTextConst = {
    empty: {
      description: '<p><b>This is where you manage data items</b></p>',
      hint: "<p>Click the (+) in the bottom right corner to create your first item (think: record / entity).</p>"
    },
    content: {
      description: '<p><b>Each row shows a data item</b> <br>They contain the data, similar to a database row.</p>',
      hint: '<p>Click on the title to edit. <br>You can also do much more - best hover over the row and icons to discover the possibilities. <br><br>You can also do data import/export (one or many), copy items, and do advanced stuff like assigning metadata.</p>'
    }
  };

  uxHelpText = computed(() => {
    const data = this.items();
    return data?.length === 0 ? this.#helpTextConst.empty : this.#helpTextConst.content;
  })

  #gridApiSig: WritableSignal<GridApi<ContentItem>> = signal<GridApi<ContentItem>>(null);

  #contentTypeStaticName = this.#dialogRouter.getParam('contentTypeStaticName');
  contentType = this.#contentTypesSvc.getType(this.#contentTypeStaticName).value;

  #itemsRaw = this.#contentItemsSvc.getAllLive(this.#contentTypeStaticName, this.refresh).value;

  items = computed(() => {
    const data = this.#itemsRaw();
    this.log.aIf('items', { data });
    return data;
  });

  ngOnInit() {
    this.urlToExportContent();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchItems());
  }

  closeDialog() {
    this.#dialog.close();
  }

  onGridReady(params: GridReadyEvent) {
    this.#gridApiSig.set(params.api);
    this.fetchColumns();
    this.urlToExportContent();
  }

  private fetchItems() {
    // Show the AG Grid loading overlay
    this.#gridApiSig().setGridOption("loading", true);
    this.refresh.update(v => ++v);
  }

  private fetchColumns() {
    this.#contentItemsSvc.getColumnsPromise(this.#contentTypeStaticName).then(columns => {
      // filter out ephemeral columns as they don't have data to show
      const columnsWithoutEphemeral = columns.filter(column => !column.IsEphemeral);
      const columnDefs = this.#buildColumnDefs(columnsWithoutEphemeral);
      const filterModel = buildFilterModel(sessionStorage.getItem(keyFilters), columnDefs);
      if (this.#gridApiSig())
        this.setColumnDefs(columnDefs, filterModel);
    });
  }

  private setColumnDefs(columnDefs: ColDef[], filterModel: AgGridFilterModel) {
    this.#gridApiSig().setGridOption("columnDefs", columnDefs);
    if (filterModel) {
      this.log.a('Will try to apply filter:', filterModel);
      this.#gridApiSig().setFilterModel(filterModel);
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
          ? ItemIdHelper.newFromType(this.#contentTypeStaticName)
          : ItemIdHelper.editId(item.Id)
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
            ? ItemIdHelper.newFromType(this.#contentTypeStaticName)
            : ItemIdHelper.editId(item.Id)
        ]
      })}`
    )
  }

  urlToNewItem(item?: ContentItem) {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          item == null
            ? ItemIdHelper.newFromType(this.#contentTypeStaticName)
            : ItemIdHelper.editId(item.Id)
        ],
      })}`
    );
  }

  // Returns the URL to the recycle bin
  urlToRecycleBin() {
    return `#/${new RouteLinkHelper().routeTo(this.#context, `app/data-${GoToRecycleBin.route}`)}`;
  }

  urlToExportContent = computedObj('urlToExportContent', () => {
    const value = this.#gridApiSig();
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
    return this.#urlTo(
      `${this.#contentTypeStaticName}${files ? `/${files.map(f => f.name).join(',')}` : ''}/import`
    );
  }

  importItem(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navRelative(['import'], { state: dialogData });
  }

  urlToImportItem() {
    return this.#urlTo('import');
  }

  createMetadata() {
    const metadataDialogRef = this.#matDialog.open(CreateMetadataDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.#viewContainerRef,
      width: '650px',
    });
    metadataDialogRef.afterClosed().subscribe((itemFor: MetadataInfo) => {
      if (itemFor == null) return;

      const form: EditForm = {
        items: [ItemIdHelper.newMetadataFromInfo(this.#contentTypeStaticName, itemFor)],
      };
      const formUrl = convertFormToUrl(form);
      this.#dialogRouter.navRelative([`edit/${formUrl}`]);
      this.#changeDetectorRef.markForCheck();
    });
  }

  debugFilter() {
    console.warn('Current filter:', this.#gridApiSig().getFilterModel());
    this.#snackBar.open('Check console for filter information', undefined, { duration: 3000 });
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
        cellRenderer: (p: { data: ContentItem, }) => AgGridHelper.cellLink(this.#urlToOpenEditView(p.data), p.data._Title),
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
                case 'export': this.#export(item); break;
                case 'delete': this.#delete(item); break;
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
        items: [ItemIdHelper.copy(this.#contentTypeStaticName, item.Id)],
      })}`
    );
  }

  #export(item: ContentItem) {
    this.#contentExportSvc.exportEntity(item.Id, this.#contentTypeStaticName, true);
  }

  // Show initial delete confirmation
  #delete(item: ContentItem) {
    this.#confirmAndExecuteDelete(
      item,
      "Delete Item?",
      false
    );
  }

  /**
   * Shows a confirmation dialog and performs delete operation if confirmed
   * @param item The item to delete
   * @param message Confirmation message to display
   * @param forceDelete Whether to force delete
   * @param dialogTitle Optional dialog title
   * @param confirmText Optional confirmation button text
   */
  #confirmAndExecuteDelete(item: ContentItem, message: string, forceDelete: boolean, dialogTitle?: string, confirmText?: string) {

    const dialogData: ConfirmDeleteDialogData = {
      entityId: item._RepositoryId,
      entityTitle: item._Title,
      message: message,
      title: dialogTitle,
      confirmTranslateKey: confirmText,
      hasDeleteSnackbar: true
    };

    this.#matDialog.open(ConfirmDeleteDialogComponent, {
      autoFocus: false,
      data: dialogData,
      viewContainerRef: this.#viewContainerRef,
      width: '400px',
    }).afterClosed().subscribe(isConfirmed => {
      if (!isConfirmed) return;

      // Execute delete operation
      this.#entitiesSvc.delete(this.#contentTypeStaticName, item._RepositoryId, forceDelete)
        .subscribe({
          next: () => {
            this.#snackBar.open('Deleted', null, { duration: 2000 });
            this.fetchItems();
          },
          error: (err: HttpErrorResponse) => {
            // Only show force delete option if this was a regular delete attempt
            // Open Dialog to confirm force delete
            if (!forceDelete) {
              this.#snackBar.dismiss();
              this.#confirmAndExecuteDelete(
                item,
                `${err.error.ExceptionMessage} \n\nDo you want to force delete`,
                true,
                'Force Delete',
                'Force'
              );
            }
          }
        });
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
