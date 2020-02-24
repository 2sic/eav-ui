import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { IMPORT_CONTENT_ITEM_DIALOG, ITEMS_EDIT_DIALOG } from '../../../../shared/constants/dialog-names';
import { EntitiesService } from '../../services/entities.service';
import { ContentExportService } from '../../services/content-export.service';
import { eavConstants, EavMetadataKey, EavKeyTypeKey } from '../../../../shared/constants/eav-constants';

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

  exportContent() {
    /*
      spm Apply filters to get a list of Ids and export that, not all content type data.
      Check 2sxc 9 export in contentItemsListController
      eavAdminDialogs.openContentExport(appId, contentType, null, ids);
    */
    this.router.navigate([`${this.contentTypeStaticName}/export`], { relativeTo: this.route });
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

    // spm Implement title functionality in edit form
    // const items = [
    //   {
    //     ContentTypeName: contentType, // otherwise the content type for new-assegnment
    //     Metadata: {
    //       Key: key,
    //       KeyType: keyType,
    //       TargetType: targetType
    //     },
    //     Title: "Add Metadata for '" + key + "' (" + keyType + ') of type #' + targetType
    //   }
    // ];

    let target: string;
    for (const metaKey of metadataKeys) {
      if (targetType !== eavConstants.metadata[metaKey].type) { continue; }
      target = eavConstants.metadata[metaKey].target;
    }

    const form: EditForm = {
      addItems: [{
        ContentTypeName: this.contentTypeStaticName,
        For: {
          Target: target,
          ...(keyType === eavConstants.keyTypes.guid && { Guid: key }),
          ...(keyType === eavConstants.keyTypes.number && { Number: parseInt(key, 10) }),
          ...(keyType === eavConstants.keyTypes.string && { String: key }),
        }
      }],
      editItems: null,
      persistedData: null
    };

    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
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
            <mat-icon class="material-icons pointer almost-implemented" action="clone" title="Clone">file_copy</mat-icon>
            &nbsp;
            <mat-icon class="material-icons pointer" action="export" title="Export">cloud_download</mat-icon>
            &nbsp;
            <mat-icon class="material-icons pointer" action="delete" title="Delete">delete</mat-icon>
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

  private activateAction(params: CellClickedEvent) {
    const item = <ContentItem>params.data;
    const action = (<HTMLElement>(<MouseEvent>params.event).target).getAttribute('action');

    switch (action) {
      case 'clone':
        // spm Implement duplicate entity in the form
        // var items = [{
        //   ContentTypeName: contentType,
        //   DuplicateEntity: item.Id
        // }];
        // eavAdminDialogs.openEditItems(items, svc.liveListReload);
        const form: EditForm = {
          addItems: [{ ContentTypeName: this.contentTypeStaticName }],
          editItems: null,
          persistedData: {},
        };
        this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
        break;
      case 'export':
        this.contentExportService.exportEntity(item.Id, this.contentTypeStaticName, true);
        break;
      case 'delete':
        if (!confirm(`Delete '${item._Title}' (${item._RepositoryId})?`)) { break; }
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
        break;
      default:
        return;
    }
  }
}
