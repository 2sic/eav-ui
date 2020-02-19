import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { ContentType } from '../shared/models/content-type.model';
import { ContentTypesService } from '../shared/services/content-types.service';
import { DataNameComponent } from '../shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from '../shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../shared/ag-grid-components/data-actions/data-actions.component';
import { eavConstants } from '../../shared/constants/eav-constants';
import { DataActionsParams } from '../shared/models/data-actions-params';
import { DataNameParams } from '../shared/models/data-name-params';
import { DataFieldsParams } from '../shared/models/data-fields-params';
import { DialogService } from '../../shared/components/dialog-service/dialog.service';
// tslint:disable-next-line:max-line-length
import { ADD_CONTENT_TYPE_DIALOG, EDIT_CONTENT_TYPE_DIALOG, EDIT_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG } from '../../shared/constants/dialog-names';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit, OnDestroy {
  contentTypes: ContentType[];

  columnDefs: ColDef[] = [
    {
      headerName: 'Name', field: 'Name', cellClass: 'clickable-with-button', cellRenderer: 'dataNameComponent',
      onCellClicked: this.handleNameCellClicked.bind(this), cellRendererParams: <DataNameParams>{
        onAddItem: this.addItem.bind(this),
      }
    },
    { headerName: 'Description', field: 'Description', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this) },
    {
      headerName: 'Fields', width: 100, field: 'Items', cellRenderer: 'dataFieldsComponent', cellRendererParams: <DataFieldsParams>{
        onEditFields: this.editFields.bind(this),
      }
    },
    {
      headerName: 'Actions', width: 200, cellRenderer: 'dataActionsComponent', cellRendererParams: <DataActionsParams>{
        onEdit: this.editContentType.bind(this),
        onCreateOrEditMetadata: this.createOrEditMetadata.bind(this),
        onOpenExport: this.openExport.bind(this),
        onOpenImport: this.openImport.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteContentType.bind(this),
      }
    },
  ];
  frameworkComponents = {
    dataNameComponent: DataNameComponent,
    dataFieldsComponent: DataFieldsComponent,
    dataActionsComponent: DataActionsComponent,
  };
  modules = AllCommunityModules;

  private scope: string;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit() {
    this.scope = eavConstants.contentType.defaultScope; // spm figure out how scope works
    this.fetchContentTypes();
    this.refreshOnClosedChildDialogs();
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

  handleNameCellClicked(params: CellClickedEvent) {
    const contentType = <ContentType>params.data;
    alert('Open table with data');
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.router.navigate([`${this.scope}/add`], { relativeTo: this.route.firstChild });
    } else {
      this.router.navigate([`${this.scope}/${contentType.Id}/edit`], { relativeTo: this.route.firstChild });
    }
  }

  fetchContentTypes() {
    this.contentTypesService.retrieveContentTypes(this.scope).subscribe(contentTypes => {
      this.contentTypes = contentTypes;
    });
  }

  createGhost() {
    alert('Create ghost');
  }

  changeScope() {
    alert('Change scope');
  }

  private addItem(contentType: ContentType) {
    this.router.navigate(['edit'], { relativeTo: this.route.firstChild });
  }

  private editFields(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/fields`], { relativeTo: this.route.firstChild });
  }

  private createOrEditMetadata(contentType: ContentType) {
    this.router.navigate(['edit'], { relativeTo: this.route.firstChild });
    const title = 'ContentType Metadata';
    if (contentType.Metadata) {
      // open edit dialog with { EntityId: item.Metadata.Id, Title: title }
    } else {
      const metadataType = 'ContentType';
      // otherwise the content type for new-assignment
      /*
        {
          ContentTypeName: metadataType,
          Metadata: {
            Key: item.StaticName,
            KeyType: "string",
            TargetType: eavConfig.metadataOfContentType
          },
          Title: title,
          Prefill: { Label: item.Name, Description: item.Description }
        }
       */
    }
  }

  private openExport(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/export`], { relativeTo: this.route.firstChild });
  }

  private openImport(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/import`], { relativeTo: this.route.firstChild });
  }

  private openPermissions(contentType: ContentType) {
    this.router.navigate(
      [`${contentType.StaticName}/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/permissions`],
      { relativeTo: this.route.firstChild }
    );
  }

  private deleteContentType(contentType: ContentType) {
    if (!confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) { return; }

    this.contentTypesService.delete(contentType).subscribe(result => {
      this.fetchContentTypes();
    });
  }

  private refreshOnClosedChildDialogs() {
    this.subscription.add(
      this.dialogService
        .subToClosed([
          ADD_CONTENT_TYPE_DIALOG,
          EDIT_CONTENT_TYPE_DIALOG,
          EDIT_FIELDS_DIALOG,
          EXPORT_CONTENT_TYPE_DIALOG,
          IMPORT_CONTENT_TYPE_DIALOG,
          SET_PERMISSIONS_DIALOG,
        ])
        .subscribe(closedDialog => {
          console.log('Dialog closed event captured:', closedDialog);
          this.fetchContentTypes();
        }),
    );
  }

}
