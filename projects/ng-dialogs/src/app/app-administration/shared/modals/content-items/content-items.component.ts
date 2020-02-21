import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { ColDef, AllCommunityModules, ICellRendererParams, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { ContentItemsService } from '../../services/content-items.service';
import { ContentItem } from '../../models/content-item.model';
import { Field } from '../../models/field.model';
import { EditForm } from '../../models/edit-form.model';
import { DialogService } from '../../../../shared/components/dialog-service/dialog.service';
import { ITEMS_EDIT_DIALOG } from '../../../../shared/constants/dialog-names';

@Component({
  selector: 'app-content-items',
  templateUrl: './content-items.component.html',
  styleUrls: ['./content-items.component.scss']
})
export class ContentItemsComponent implements OnInit, OnDestroy {
  items: ContentItem[];

  columnDefs: ColDef[];
  frameworkComponents = {
  };
  modules = AllCommunityModules;

  private contentTypeStaticName: string;
  private subscription: Subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ContentItemsComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private dialogService: DialogService,
  ) {
    this.contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  }

  ngOnInit() {
    this.fetchItems();
    this.contentItemsService.getColumns(this.contentTypeStaticName).subscribe(columns => {
      this.buildTable(columns);
    });
    this.subscription.add(
      this.dialogService.subToClosed([ITEMS_EDIT_DIALOG]).subscribe(closedDialog => {
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
        headerName: 'Status', field: 'IsPublished', cellClass: 'no-outline no-select', width: 90, suppressSizeToFit: true,
        cellRenderer: (params: ICellRendererParams) => {
          const item = <ContentItem>params.data;
          // spm something about data.DraftEntity and data.PublishedEntity is missing. Search in eav-ui project
          return `
            <div class="icon-container">
              <mat-icon class="material-icons help" title="${item.IsPublished ? 'Published' : 'Not published'}">
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
        headerName: '', cellClass: 'no-padding no-outline no-select', width: 80, suppressSizeToFit: true,
        onCellClicked: this.activateAction.bind(this), template: `
          <div class="icon-container">
            <mat-icon class="material-icons pointer not-implemented" action="clone" title="Clone">file_copy</mat-icon>
            &nbsp;
            <mat-icon class="material-icons pointer not-implemented" action="export" title="Export">cloud_download</mat-icon>
            &nbsp;
            <mat-icon class="material-icons pointer not-implemented" action="delete" title="Delete">delete</mat-icon>
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
    let form: EditForm;
    if (!params) {
      form = {
        addItems: [{ ContentTypeName: this.contentTypeStaticName }],
        editItems: null,
        persistedData: {},
      };
      this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
    } else {
      const item = <ContentItem>params.data;
      form = {
        addItems: null,
        editItems: [{ EntityId: item.Id.toString(), Title: item.Title }],
        persistedData: {},
      };
    }
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
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
