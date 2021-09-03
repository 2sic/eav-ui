import { AllCommunityModules, CellClickedEvent, ColDef, GridApi, GridOptions, GridReadyEvent, ValueGetterParams } from '@ag-grid-community/all-modules';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith, take } from 'rxjs/operators';
import { GlobalConfigService } from '../../../../edit/shared/store/ngrx-data';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { ContentImportDialogData } from '../content-import/content-import-dialog.config';
import { DataTypeConstants } from '../content-type-fields/constants/data-type.constants';
import { Field } from '../content-type-fields/models/field.model';
import { BooleanFilterComponent } from '../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { keyFilters } from '../shared/constants/session.constants';
import { consoleLogAngular } from '../shared/helpers/console-log-angular.helper';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ContentItemsActionsComponent } from './ag-grid-components/content-items-actions/content-items-actions.component';
import { ContentItemsActionsParams } from './ag-grid-components/content-items-actions/content-items-actions.models';
import { ContentItemsEntityComponent } from './ag-grid-components/content-items-entity/content-items-entity.component';
import { ContentItemsStatusComponent } from './ag-grid-components/content-items-status/content-items-status.component';
import { PubMetaFilterComponent } from './ag-grid-components/pub-meta-filter/pub-meta-filter.component';
import { PubMeta } from './ag-grid-components/pub-meta-filter/pub-meta-filter.model';
import { ContentItemImportDialogData } from './content-item-import/content-item-import-dialog.config';
import { buildFilterModel } from './content-items.helpers';
import { CreateMetadataDialogComponent } from './create-metadata-dialog/create-metadata-dialog.component';
import { MetadataInfo } from './create-metadata-dialog/create-metadata-dialog.models';
import { AgGridFilterModel } from './models/ag-grid-filter.model';
import { ContentItem } from './models/content-item.model';
import { ExtendedColDef } from './models/extended-col-def.model';
import { ContentItemsService } from './services/content-items.service';
import { EntitiesService } from './services/entities.service';

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.component.html',
  styleUrls: ['./content-items.component.scss'],
})
export class ContentItemsComponent implements OnInit, OnDestroy {
  contentType$ = new BehaviorSubject<ContentType>(null);
  items$ = new BehaviorSubject<ContentItem[]>(null);
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      pubMetaFilterComponent: PubMetaFilterComponent,
      booleanFilterComponent: BooleanFilterComponent,
      idFieldComponent: IdFieldComponent,
      contentItemsStatusComponent: ContentItemsStatusComponent,
      contentItemsActionsComponent: ContentItemsActionsComponent,
      contentItemsEntityComponent: ContentItemsEntityComponent,
    },
  };

  private gridApi$ = new BehaviorSubject<GridApi>(null);
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ContentItemsComponent>,
    private contentTypesService: ContentTypesService,
    private router: Router,
    private route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private entitiesService: EntitiesService,
    private contentExportService: ContentExportService,
    private snackBar: MatSnackBar,
    private globalConfigService: GlobalConfigService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.fetchContentType();
    this.fetchItems();
    this.fetchColumns();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.items$.complete();
    this.gridApi$.complete();
    this.subscription.unsubscribe();
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
      const filterModel = buildFilterModel(sessionStorage.getItem(keyFilters));
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

  editItem(params: CellClickedEvent) {
    const item: ContentItem = params?.data;
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
        ids.push((rowNode.data as ContentItem).Id);
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
    const dialogData: ContentItemImportDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route, state: dialogData });
  }

  addMetadata() {
    const metadataDialogRef = this.dialog.open(CreateMetadataDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    metadataDialogRef.afterClosed().pipe(take(1)).subscribe((res: MetadataInfo) => {
      if (res == null) { return; }

      const form: EditForm = {
        items: [{
          ContentTypeName: this.contentTypeStaticName,
          For: {
            Target: res.target,
            ...(res.keyType === eavConstants.keyTypes.guid && { Guid: res.key }),
            ...(res.keyType === eavConstants.keyTypes.number && { Number: parseInt(res.key, 10) }),
            ...(res.keyType === eavConstants.keyTypes.string && { String: res.key }),
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
    alert('Check console for filter information');
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchItems();
      })
    );
  }

  private buildColumnDefs(columns: Field[]) {
    const columnDefs: ColDef[] = [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        cellRendererParams: {
          tooltipGetter: (paramsData: ContentItem) => `ID: ${paramsData.Id}\nRepoID: ${paramsData._RepositoryId}\nGUID: ${paramsData.Guid}`,
        } as IdFieldParams,
      },
      {
        headerName: 'Status', field: 'Status', width: 80, headerClass: 'dense', cellClass: 'no-outline',
        filter: 'pubMetaFilterComponent', cellRenderer: 'contentItemsStatusComponent', valueGetter: this.valueGetterStatus,
      },
      {
        headerName: 'Item (Entity)', field: '_Title', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.editItem.bind(this),
      },
      {
        headerName: 'Stats', headerTooltip: 'Used by others / uses others',
        field: '_Used', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.valueGetterUsage,
      },
      {
        cellClass: 'secondary-action no-padding', width: 120, cellRenderer: 'contentItemsActionsComponent', pinned: 'right',
        cellRendererParams: {
          onClone: this.clone.bind(this),
          onExport: this.export.bind(this),
          onDelete: this.delete.bind(this),
        } as ContentItemsActionsParams,
      },
    ];
    for (const column of columns) {
      const colDef: ExtendedColDef = {
        headerName: column.StaticName, field: column.StaticName, flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true,
      };
      switch (column.Type) {
        case DataTypeConstants.Entity:
          try {
            colDef.allowMultiValue = column.Metadata.Entity.AllowMultiValue;
          } catch (e) {
            colDef.allowMultiValue = true;
          }
          colDef.cellRenderer = 'contentItemsEntityComponent';
          colDef.valueGetter = this.valueGetterEntityField;
          colDef.filter = 'agTextColumnFilter';
          break;
        case DataTypeConstants.DateTime:
          try {
            colDef.useTimePicker = column.Metadata.DateTime.UseTimePicker;
          } catch (e) {
            colDef.useTimePicker = false;
          }
          colDef.valueGetter = this.valueGetterDateTime;
          colDef.filter = 'agTextColumnFilter';
          break;
        case DataTypeConstants.Boolean:
          colDef.valueGetter = this.valueGetterBoolean;
          colDef.filter = 'booleanFilterComponent';
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

  private valueGetterStatus(params: ValueGetterParams) {
    const item: ContentItem = params.data;
    const published: PubMeta = {
      published: item.IsPublished,
      metadata: !!item.For,
    };
    return published;
  }

  private valueGetterUsage(params: ValueGetterParams) {
    const item: ContentItem = params.data;
    return `${item._Used} / ${item._Uses}`;
  }

  private valueGetterEntityField(params: ValueGetterParams) {
    const rawValue: ContentItem[] = params.data[params.colDef.field];
    if (rawValue.length === 0) { return null; }
    return rawValue.map(item => item.Title);
  }

  private valueGetterDateTime(params: ValueGetterParams) {
    const rawValue: string = params.data[params.colDef.field];
    if (!rawValue) { return null; }

    // remove 'Z' and replace 'T'
    return (params.colDef as ExtendedColDef).useTimePicker ? rawValue.substring(0, 19).replace('T', ' ') : rawValue.substring(0, 10);
  }

  private valueGetterBoolean(params: ValueGetterParams) {
    const rawValue = params.data[params.colDef.field];
    if (typeof rawValue !== typeof true) { return null; }
    return rawValue.toString();
  }
}
