import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent, GridApi, ValueGetterParams } from '@ag-grid-community/all-modules';

import { ContentItemsService } from '../../services/content-items.service';
import { ContentItem } from '../../models/content-item.model';
import { Field } from '../../models/field.model';
import { EditForm } from '../../models/edit-form.model';
import { DialogService } from '../../../../shared/components/dialog-service/dialog.service';
import { IMPORT_CONTENT_ITEM_DIALOG, ITEMS_EDIT_DIALOG } from '../../../../shared/constants/dialog-names';
import { EntitiesService } from '../../services/entities.service';
import { ContentExportService } from '../../services/content-export.service';
import { eavConstants, EavMetadataKey, EavKeyTypeKey } from '../../../../shared/constants/eav-constants';
import { PubMetaFilterComponent } from '../../../../shared/ag-grid-filters/pub-meta-filter/pub-meta-filter.component';
import { ExtendedColDef } from '../../models/extended-col-def.model';
import { ContentItemsIdComponent } from '../../ag-grid-components/content-items-id/content-items-id.component';
import { ContentItemsStatusComponent } from '../../ag-grid-components/content-items-status/content-items-status.component';
import { ContentItemsActionsComponent } from '../../ag-grid-components/content-items-actions/content-items-actions.component';
import { ContentItemsActionsParams } from '../../models/content-items-actions-params';
import { ContentItemsEntityComponent } from '../../ag-grid-components/content-items-entity/content-items-entity.component';
import { PubMeta } from '../../../../shared/ag-grid-filters/pub-meta-filter/pub-meta-filter.model';

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.component.html',
  styleUrls: ['./content-items.component.scss']
})
export class ContentItemsComponent implements OnInit, OnDestroy {
  items: ContentItem[];

  private gridApi: GridApi;
  columnDefs: ColDef[];
  frameworkComponents = {
    pubMetaFilterComponent: PubMetaFilterComponent,
    contentItemsIdComponent: ContentItemsIdComponent,
    contentItemsStatusComponent: ContentItemsStatusComponent,
    contentItemsActionsComponent: ContentItemsActionsComponent,
    contentItemsEntityComponent: ContentItemsEntityComponent,
  };
  modules = AllCommunityModules;

  private contentTypeStaticName: string;
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ContentItemsComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private dialogService: DialogService,
    private entitiesService: EntitiesService,
    private contentExportService: ContentExportService,
  ) {
    this.contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  }

  ngOnInit() {
    this.fetchItems();
    this.contentItemsService.getColumns(this.contentTypeStaticName).subscribe(columns => {
      this.buildTable(columns);
    });
    this.subscription.add(
      this.dialogService.subToClosed([IMPORT_CONTENT_ITEM_DIALOG, ITEMS_EDIT_DIALOG]).subscribe(closedDialog => {
        console.log('Dialog closed event captured:', closedDialog);
        this.fetchItems();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchItems() {
    this.contentItemsService.getAll(this.contentTypeStaticName).subscribe(items => {
      this.items = items;
    });
  }

  editItem(params: CellClickedEvent) {
    let form: EditForm;
    if (params === null) {
      form = {
        items: [{ ContentTypeName: this.contentTypeStaticName }],
        persistedData: null,
      };
    } else {
      const item = <ContentItem>params.data;
      form = {
        items: [{ EntityId: item.Id.toString(), Title: item.Title }],
        persistedData: null,
      };
    }
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  exportContent() {
    const filterModel = this.gridApi.getFilterModel();
    const hasFilters = Object.keys(filterModel).length > 0;
    const ids: number[] = [];
    if (hasFilters) {
      this.gridApi.forEachNodeAfterFilterAndSort(rowNode => {
        ids.push((<ContentItem>rowNode.data).Id);
      });
    }
    this.router.navigate([`${this.contentTypeStaticName}/export${ids.length > 0 ? `/${ids}` : ''}`], { relativeTo: this.route });
  }

  importItem() {
    this.router.navigate(['import'], { relativeTo: this.route });
  }

  addMetadata() {
    if (!confirm(
      'This is a special operation to add an item which is metadata for another item.'
      + ' If you didn\'t understand that, this is not for you :). Continue?'
    )) { return; }

    const metadataKeys = <EavMetadataKey[]>Object.keys(eavConstants.metadata);
    const validTargetTypes = metadataKeys.map(metaKey => eavConstants.metadata[metaKey].type);
    const targetType = parseInt(prompt(
      'What kind of assignment do you want?'
      + metadataKeys.map(metaKey => `\n${eavConstants.metadata[metaKey].type}: ${eavConstants.metadata[metaKey].target}`),
      eavConstants.metadata.entity.type.toString()
    ), 10);
    if (!targetType) { return alert('No target type entered. Cancelled'); }
    if (!validTargetTypes.includes(targetType)) { return alert('Invalid target type. Cancelled'); }

    const key = prompt('What key do you want?');
    if (!key) { return alert('No key entered. Cancelled'); }

    const keyTypeKeys = <EavKeyTypeKey[]>Object.keys(eavConstants.keyTypes);
    const validKeyTypes = keyTypeKeys.map(keyTypeKey => eavConstants.keyTypes[keyTypeKey]);
    const keyType = prompt(
      'What key type do you want?'
      + keyTypeKeys.map(keyTypeKey => `\n${eavConstants.keyTypes[keyTypeKey]}`),
      eavConstants.keyTypes.number
    );
    if (!keyType) { return alert('No key type entered. Cancelled'); }
    if (!validKeyTypes.includes(keyType)) { return alert('Invalid key type. Cancelled'); }
    if (keyType === eavConstants.keyTypes.number && !parseInt(key, 10)) {
      return alert('Key type number and key don\'t match. Cancelled');
    }

    let target: string;
    for (const metaKey of metadataKeys) {
      if (targetType !== eavConstants.metadata[metaKey].type) { continue; }
      target = eavConstants.metadata[metaKey].target;
    }

    const form: EditForm = {
      items: [{
        ContentTypeName: this.contentTypeStaticName,
        For: {
          Target: target,
          ...(keyType === eavConstants.keyTypes.guid && { Guid: key }),
          ...(keyType === eavConstants.keyTypes.number && { Number: parseInt(key, 10) }),
          ...(keyType === eavConstants.keyTypes.string && { String: key }),
        },
        Title: `Add Metadata for '${key}' (${keyType}) of type #${targetType}`,
      }],
      persistedData: null,
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  debugFilter() {
    console.warn('Current filter: ', this.gridApi.getFilterModel());
    alert('Check console for filter information');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private buildTable(columns: Field[]) {
    const columnDefs: ColDef[] = [
      {
        headerName: 'ID', field: 'Id', width: 110, suppressSizeToFit: true, cellClass: 'clickable',
        onCellClicked: this.editItem.bind(this), filter: 'agNumberColumnFilter', cellRenderer: 'contentItemsIdComponent',
      },
      {
        headerName: 'Status', cellClass: 'no-outline no-select', width: 130, suppressSizeToFit: true, sortable: false,
        valueGetter: this.valueGetterStatus, filter: 'pubMetaFilterComponent', cellRenderer: 'contentItemsStatusComponent',
      },
      {
        headerName: 'Title', field: '_Title', cellClass: 'clickable', width: 200, suppressSizeToFit: true,
        filter: 'agTextColumnFilter', onCellClicked: this.editItem.bind(this),
      },
      {
        cellClass: 'no-padding no-outline no-select', width: 140, suppressSizeToFit: true, cellRenderer: 'contentItemsActionsComponent',
        cellRendererParams: <ContentItemsActionsParams>{
          onClone: this.clone.bind(this),
          onExport: this.export.bind(this),
          onDelete: this.delete.bind(this),
        }
      },
    ];
    for (const column of columns) {
      if (column.IsTitle) { continue; }
      const colDef: ExtendedColDef = { headerName: column.StaticName, field: column.StaticName, minWidth: 250, filter: true };
      switch (column.Type) {
        case 'Entity':
          try {
            colDef.allowMultiValue = column.Metadata.Entity.AllowMultiValue;
          } catch (e) {
            colDef.allowMultiValue = true;
          }
          colDef.cellRenderer = 'contentItemsEntityComponent';
          colDef.valueGetter = this.valueGetterEntityField;
          break;
        case 'DateTime':
          try {
            colDef.useTimePicker = column.Metadata.DateTime.UseTimePicker;
          } catch (e) {
            colDef.useTimePicker = false;
          }
          colDef.valueGetter = this.valueGetterDateTime;
          break;
        case 'Boolean':
          colDef.valueGetter = this.valueGetterBoolean;
          break;
        case 'Number':
          colDef.filter = 'number';
          break;
      }
      columnDefs.push(colDef);
    }
    this.columnDefs = columnDefs;
  }

  private clone(item: ContentItem) {
    const form: EditForm = {
      items: [{ ContentTypeName: this.contentTypeStaticName, DuplicateEntity: item.Id }],
      persistedData: null,
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  private export(item: ContentItem) {
    this.contentExportService.exportEntity(item.Id, this.contentTypeStaticName, true);
  }

  private delete(item: ContentItem) {
    if (!confirm(`Delete '${item._Title}' (${item._RepositoryId})?`)) { return; }
    this.entitiesService.delete(this.contentTypeStaticName, item._RepositoryId, false).subscribe({
      next: () => {
        this.fetchItems();
      },
      error: (err: HttpErrorResponse) => {
        if (!confirm(`${err.error.ExceptionMessage}\n\nDo you want to force delete '${item._Title}' (${item._RepositoryId})?`)) {
          return;
        }
        this.entitiesService.delete(this.contentTypeStaticName, item._RepositoryId, true).subscribe(() => {
          this.fetchItems();
        });
      }
    });
  }

  private valueGetterStatus(params: ValueGetterParams) {
    const item: ContentItem = params.data;
    const published: PubMeta = {
      published: item.IsPublished,
      metadata: !!item.Metadata,
    };
    return published;
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
    return (<ExtendedColDef>params.colDef).useTimePicker ? rawValue.substring(0, 19).replace('T', ' ') : rawValue.substring(0, 10);
  }

  private valueGetterBoolean(params: ValueGetterParams) {
    const rawValue = params.data[params.colDef.field];
    if (typeof rawValue !== 'boolean') { return null; }
    return rawValue.toString();
  }
}
