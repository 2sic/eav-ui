import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
// tslint:disable-next-line:max-line-length
import { ColDef, AllCommunityModules, ICellRendererParams, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { ContentItemsService } from '../../services/content-items.service';
import { ContentItem } from '../../models/content-item.model';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.component.html',
  styleUrls: ['./content-items.component.scss']
})
export class ContentItemsComponent implements OnInit {
  items: ContentItem[];

  columnDefs: ColDef[];
  frameworkComponents = {
  };
  modules = AllCommunityModules;

  constructor(
    private dialogRef: MatDialogRef<ContentItemsComponent>,
    private route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
  ) { }

  ngOnInit() {
    this.fetchItems();
    this.contentItemsService.getColumns(this.route.snapshot.paramMap.get('contentTypeStaticName')).subscribe(columns => {
      this.buildTable(columns);
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchItems() {
    this.contentItemsService.getAll(this.route.snapshot.paramMap.get('contentTypeStaticName')).subscribe(items => {
      this.items = items;
    });
  }

  exportContent() {
    alert('Export content');
  }

  importItem() {
    alert('Import item');
  }

  addMetadata() {
    alert('Add metadata');
  }

  debugFilter() {
    alert('Debug filter');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private buildTable(columns: Field[]) {
    const columnDefs: ColDef[] = [
      {
        headerName: 'ID', field: 'Id', width: 80, suppressSizeToFit: true, cellClass: 'clickable', onCellClicked: this.editItem.bind(this),
        cellRenderer: (params: ICellRendererParams) => {
          const item = <ContentItem>params.data;
          return `
            <div title="Id: ${item.Id}\nRepoId: ${item._RepositoryId}\nGuid: ${item.Guid}">
              ${item.Id}
            </div>
          `;
        }
      },
      {
        headerName: 'Status', field: 'IsPublished', width: 90, suppressSizeToFit: true,
        cellRenderer: (params: ICellRendererParams) => {
          const item = <ContentItem>params.data;
          // spm something about data.DraftEntity and data.PublishedEntity is missing. Search in eav-ui project
          return `
            <div class="icon-container" title="${item.IsPublished ? 'Published' : 'Not published'}">
              <mat-icon class="material-icons">
                ${item.IsPublished ? 'visibility' : 'visibility_off'}
              </mat-icon>
            </div>
          `;
        }
      },
      {
        headerName: 'Title', field: '_Title', cellClass: 'clickable', width: 200, suppressSizeToFit: true,
        onCellClicked: this.editItem.bind(this),
      },
      {
        headerName: '', cellClass: 'no-padding no-outline', width: 80, suppressSizeToFit: true,
        onCellClicked: this.activateAction.bind(this), template: `
          <div class="icon-container">
            <mat-icon class="material-icons button not-implemented" action="clone" title="Clone">file_copy</mat-icon>
            &nbsp;
            <mat-icon class="material-icons button not-implemented" action="export" title="Export">cloud_download</mat-icon>
            &nbsp;
            <mat-icon class="material-icons button not-implemented" action="delete" title="Delete">delete</mat-icon>
          </div>
        `,
      },
    ];
    for (const column of columns) {
      if (column.IsTitle) { continue; }
      columnDefs.push({ headerName: column.StaticName, field: column.StaticName, minWidth: 250 });
    }
    this.columnDefs = columnDefs;
  }

  editItem(params: CellClickedEvent) {
    if (!params) {
      alert('Add item');
      return;
    }
    const item = <ContentItem>params.data;
    alert('Edit item');
  }

  private activateAction(params: CellClickedEvent) {
    const item = <ContentItem>params.data;
    const action = (<HTMLElement>(<MouseEvent>params.event).target).getAttribute('action');

    switch (action) {
      case 'clone':
        alert('Clone item');
        break;
      case 'export':
        alert('Export item');
        break;
      case 'delete':
        alert('Delete item');
        break;
      default:
        return;
    }
  }
}
