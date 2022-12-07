import { ColDef, GridApi, GridOptions, GridReadyEvent, ValueGetterParams } from '@ag-grid-community/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, filter, take } from 'rxjs';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { ContentImportDialogData } from '../content-import/content-import-dialog.config';
import { DataTypeConstants } from '../content-type-fields/constants/data-type.constants';
import { Field } from '../content-type-fields/models/field.model';
import { GlobalConfigService } from '../edit/shared/store/ngrx-data';
import { GoToMetadata } from '../metadata';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { BooleanFilterComponent } from '../shared/components/boolean-filter/boolean-filter.component';
import { EntityFilterComponent } from '../shared/components/entity-filter/entity-filter.component';
import { FileUploadDialogData } from '../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { keyFilters } from '../shared/constants/session.constants';
import { consoleLogAngular } from '../shared/helpers/console-log-angular.helper';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ContentItemsActionsComponent } from './content-items-actions/content-items-actions.component';
import { ContentItemsActionsParams } from './content-items-actions/content-items-actions.models';
import { ContentItemsEntityComponent } from './content-items-entity/content-items-entity.component';
import { ContentItemsStatusComponent } from './content-items-status/content-items-status.component';
import { ContentItemsStatusParams } from './content-items-status/content-items-status.models';
import { buildFilterModel } from './content-items.helpers';
import { CreateMetadataDialogComponent } from './create-metadata-dialog/create-metadata-dialog.component';
import { MetadataInfo } from './create-metadata-dialog/create-metadata-dialog.models';
import { AgGridFilterModel } from './models/ag-grid-filter.model';
import { ContentItem } from './models/content-item.model';
import { ExtendedColDef } from './models/extended-col-def.model';
import { PubMetaFilterComponent } from './pub-meta-filter/pub-meta-filter.component';
import { PubMeta } from './pub-meta-filter/pub-meta-filter.model';
import { ContentItemsService } from './services/content-items.service';
import { EntitiesService } from './services/entities.service';

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.component.html',
  styleUrls: ['./content-items.component.scss'],
})
export class ContentItemsComponent extends BaseComponent implements OnInit, OnDestroy {
  contentType$ = new BehaviorSubject<ContentType>(undefined);
  items$ = new BehaviorSubject<ContentItem[]>(undefined);
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();
  gridOptions: GridOptions = {
    ...defaultGridOptions,
  };

  private gridApi$ = new BehaviorSubject<GridApi>(null);
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  constructor(
    private dialogRef: MatDialogRef<ContentItemsComponent>,
    private contentTypesService: ContentTypesService,
    router: Router,
    route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private entitiesService: EntitiesService,
    private contentExportService: ContentExportService,
    private snackBar: MatSnackBar,
    private globalConfigService: GlobalConfigService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { 
    super(router, route);
  }

  ngOnInit() {
    this.fetchContentType();
    this.fetchItems();
    this.fetchColumns();
    this.subscription.add(this.refreshOnChildClosed().subscribe(() => { this.fetchItems(); }));
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.items$.complete();
    this.gridApi$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi$.next(params.api);
  }

  private fetchContentType() {
    this.contentTypesService.retrieveContentType(this.contentTypeStaticName).subscribe(contentType => {
      this.contentType$.next(contentType);
    });
  }

  private fetchItems() {
    this.contentItemsService.getAll(this.contentTypeStaticName).subscribe(items => {
      this.items$.next(items);
    });
  }

  private fetchColumns() {
    this.contentItemsService.getColumns(this.contentTypeStaticName).subscribe(columns => {
      const columnDefs = this.buildColumnDefs(columns);
      const filterModel = buildFilterModel(sessionStorage.getItem(keyFilters), columnDefs);
      if (this.gridApi$.value) {
        this.setColumnDefs(columnDefs, filterModel);
      } else {
        this.gridApi$.pipe(
          filter(gridApi => gridApi != null), // firefox does web requests faster than drawing grid and getting gridApi
          take(1),
        ).subscribe(gridApi => {
          this.setColumnDefs(columnDefs, filterModel);
        });
      }
    });
  }

  private setColumnDefs(columnDefs: ColDef[], filterModel: AgGridFilterModel) {
    this.gridApi$.value.setColumnDefs(columnDefs);
    if (filterModel) {
      consoleLogAngular('Will try to apply filter:', filterModel);
      this.gridApi$.value.setFilterModel(filterModel);
    }
  }

  openMetadata(item: ContentItem) {
    const url = GoToMetadata.getUrlEntity(
      item.Guid,
      `Metadata for Entity: ${item._Title} (${item.Id})`,
      this.contentTypeStaticName,
    );
    this.router.navigate([url], { relativeTo: this.route });
  }

  editItem(item?: ContentItem) {
    const form: EditForm = {
      items: [
        item == null
          ? { ContentTypeName: this.contentTypeStaticName }
          : { EntityId: item.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  exportContent() {
    const filterModel = this.gridApi$.value.getFilterModel();
    const hasFilters = Object.keys(filterModel).length > 0;
    const ids: number[] = [];
    if (hasFilters) {
      this.gridApi$.value.forEachNodeAfterFilterAndSort(rowNode => {
        const contentItem: ContentItem = rowNode.data;
        ids.push(contentItem.Id);
      });
    }
    this.router.navigate([`export/${this.contentTypeStaticName}${ids.length > 0 ? `/${ids}` : ''}`], { relativeTo: this.route });
  }

  filesDropped(files: File[]) {
    const importFile = files[0];
    const ext = importFile.name.substring(importFile.name.lastIndexOf('.') + 1).toLocaleLowerCase();
    switch (ext) {
      case 'xml':
        this.importContent(files);
        break;
      case 'json':
        this.importItem(files);
        break;
    }
  }

  importContent(files?: File[]) {
    const dialogData: ContentImportDialogData = { files };
    this.router.navigate([`${this.contentTypeStaticName}/import`], { relativeTo: this.route, state: dialogData });
  }

  importItem(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route, state: dialogData });
  }

  createMetadata() {
    const metadataDialogRef = this.dialog.open(CreateMetadataDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    metadataDialogRef.afterClosed().subscribe((itemFor: MetadataInfo) => {
      if (itemFor == null) { return; }

      const form: EditForm = {
        items: [{
          ContentTypeName: this.contentTypeStaticName,
          For: {
            Target: itemFor.target ?? itemFor.targetType.toString(),
            TargetType: itemFor.targetType,
            ...(itemFor.keyType === eavConstants.keyTypes.guid && { Guid: itemFor.key }),
            ...(itemFor.keyType === eavConstants.keyTypes.number && { Number: parseInt(itemFor.key, 10) }),
            ...(itemFor.keyType === eavConstants.keyTypes.string && { String: itemFor.key }),
          },
        }],
      };
      const formUrl = convertFormToUrl(form);
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
      this.changeDetectorRef.markForCheck();
    });
  }

  debugFilter() {
    console.warn('Current filter:', this.gridApi$.value.getFilterModel());
    this.snackBar.open('Check console for filter information', undefined, { duration: 3000 });
  }

  private buildColumnDefs(columns: Field[]) {
    const columnDefs: ColDef[] = [
      {
        headerName: 'ID',
        field: 'Id',
        width: 70,
        headerClass: 'dense',
        sortable: true,
        filter: 'agNumberColumnFilter',
        cellClass: (params) => {
          const contentItem: ContentItem = params.data;
          return `id-action no-padding no-outline ${contentItem._EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
        },
        valueGetter: (params) => {
          const contentItem: ContentItem = params.data;
          return contentItem.Id;
        },
        cellRenderer: IdFieldComponent,
        cellRendererParams: (() => {
          const params: IdFieldParams<ContentItem> = {
            tooltipGetter: (item) => `ID: ${item.Id}\nRepoID: ${item._RepositoryId}\nGUID: ${item.Guid}`,
          };
          return params;
        })(),
      },
      {
        field: 'Status',
        width: 82,
        headerClass: 'dense',
        cellClass: 'secondary-action no-padding'.split(' '),
        filter: PubMetaFilterComponent,
        valueGetter: (params) => {
          const item: ContentItem = params.data;
          const published: PubMeta = {
            published: item.IsPublished,
            metadata: !!item.For,
            hasMetadata: item.Metadata ? item.Metadata.length > 0 : false,
          };
          return published;
        },
        cellRenderer: ContentItemsStatusComponent,
        cellRendererParams: (() => {
          const params: ContentItemsStatusParams = {
            onOpenMetadata: (item) => this.openMetadata(item),
          };
          return params;
        })(),
      },
      {
        headerName: 'Item (Entity)',
        field: '_Title',
        flex: 2,
        minWidth: 250,
        cellClass: 'primary-action highlight'.split(' '),
        sortable: true,
        filter: 'agTextColumnFilter',
        onCellClicked: (params) => {
          const contentItem: ContentItem = params.data;
          this.editItem(contentItem);
        },
        valueGetter: (params) => {
          const contentItem: ContentItem = params.data;
          return contentItem._Title;
        },
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
        valueGetter: (params) => {
          const item: ContentItem = params.data;
          return `${item._Used} / ${item._Uses}`;
        },
      },
      {
        cellClass: 'secondary-action no-padding'.split(' '),
        width: 122,
        pinned: 'right',
        cellRenderer: ContentItemsActionsComponent,
        cellRendererParams: (() => {
          const params: ContentItemsActionsParams = {
            onClone: (item) => this.clone(item),
            onExport: (item) => this.export(item),
            onDelete: (item) => this.delete(item),
          };
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
        case DataTypeConstants.Entity:
          colDef.allowMultiValue = column.Metadata?.Entity?.AllowMultiValue ?? true;
          colDef.cellRenderer = ContentItemsEntityComponent;
          colDef.valueGetter = this.valueGetterEntityField;
          colDef.filter = EntityFilterComponent;
          break;
        case DataTypeConstants.DateTime:
          colDef.useTimePicker = column.Metadata?.DateTime?.UseTimePicker ?? false;
          colDef.valueGetter = this.valueGetterDateTime;
          colDef.filter = 'agTextColumnFilter';
          break;
        case DataTypeConstants.Boolean:
          colDef.valueGetter = this.valueGetterBoolean;
          colDef.filter = BooleanFilterComponent;
          break;
        case DataTypeConstants.Number:
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

  private clone(item: ContentItem) {
    const form: EditForm = {
      items: [{ ContentTypeName: this.contentTypeStaticName, DuplicateEntity: item.Id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  private export(item: ContentItem) {
    this.contentExportService.exportEntity(item.Id, this.contentTypeStaticName, true);
  }

  private delete(item: ContentItem) {
    if (!confirm(`Delete '${item._Title}' (${item._RepositoryId})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.entitiesService.delete(this.contentTypeStaticName, item._RepositoryId, false).subscribe({
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
        this.entitiesService.delete(this.contentTypeStaticName, item._RepositoryId, true).subscribe(() => {
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
