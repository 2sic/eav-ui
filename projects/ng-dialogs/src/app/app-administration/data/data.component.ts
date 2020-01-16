import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { ContentType } from '../shared/models/content-type.model';
import { ContentTypesService } from '../shared/services/content-types.service';
import { DataNameComponent } from '../shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from '../shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../shared/ag-grid-components/data-actions/data-actions.component';
import { EavConfigurationService } from '../shared/services/eav-configuration.service';
import { DataActionsParams } from '../shared/models/data-actions-params';
import { DataNameParams } from '../shared/models/data-name-params';
import { ContentExportComponent } from '../shared/modals/content-export/content-export.component';
import { ContentExportDialogData } from '../shared/models/content-export-dialog-data.model';
import { ContentImportDialogData } from '../shared/models/content-import-dialog-data.model';
import { ContentImportComponent } from '../shared/modals/content-import/content-import.component';
import { PermissionsDialogData } from '../shared/models/permissions-dialog-data.model';
import { PermissionsComponent } from '../shared/modals/permissions/permissions.component';
import { DataFieldsParams } from '../shared/models/data-fields-params';
import { EditFieldsDialogData } from '../shared/models/edit-fields-dialog-data.model';
import { EditFieldsComponent } from '../shared/modals/edit-fields/edit-fields.component';
import { ADD_CONTENT_TYPE_DIALOG_CLOSED, EDIT_CONTENT_TYPE_DIALOG_CLOSED } from '../../shared/constants/navigation-messages';
import { DialogService } from '../../shared/components/dialog-closed/dialog.service';

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
  private editFieldsDialogRef: MatDialogRef<EditFieldsComponent, any>;
  private contentExportDialogRef: MatDialogRef<ContentExportComponent, any>;
  private contentImportDialogRef: MatDialogRef<ContentImportComponent, any>;
  private permissionsDialogRef: MatDialogRef<PermissionsComponent, any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private contentTypesService: ContentTypesService,
    private eavConfigurationService: EavConfigurationService,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
    this.scope = this.eavConfigurationService.contentType.defaultScope; // spm figure out how scope works
    this.fetchContentTypes();
    this.initChildDialogSub();
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
    alert('Open content type data!');
    // open content type data modal
  }

  private addItem(contentType: ContentType) {
    alert('Open Edit Ui');
  }

  private editFields(contentType: ContentType) {
    const dialogData: EditFieldsDialogData = {
      contentType: contentType,
    };
    this.editFieldsDialogRef = this.dialog.open(EditFieldsComponent, {
      backdropClass: 'edit-fields-dialog-backdrop',
      panelClass: ['edit-fields-dialog-panel', 'dialog-panel-large'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      data: dialogData,
    });
    this.subscription.add(
      this.editFieldsDialogRef.afterClosed().subscribe(() => {
        console.log('Edit fields dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.refreshOnSubDialogClosed(ADD_CONTENT_TYPE_DIALOG_CLOSED);
      this.router.navigate([`${this.scope}/add`], { relativeTo: this.route.firstChild });
    } else {
      this.refreshOnSubDialogClosed(EDIT_CONTENT_TYPE_DIALOG_CLOSED);
      this.router.navigate([`${this.scope}/${contentType.Id}/edit`], { relativeTo: this.route.firstChild });
    }
  }

  private createOrEditMetadata(contentType: ContentType) {
    alert('Create or edit metadata!');
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
    const dialogData: ContentExportDialogData = {
      staticName: contentType.StaticName,
    };
    this.contentExportDialogRef = this.dialog.open(ContentExportComponent, {
      backdropClass: 'content-export-dialog-backdrop',
      panelClass: ['content-export-dialog-panel', 'dialog-panel-medium'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      data: dialogData,
    });
    this.subscription.add(
      this.contentExportDialogRef.afterClosed().subscribe(() => {
        console.log('Content export dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private openImport(contentType: ContentType) {
    const dialogData: ContentImportDialogData = {
      staticName: contentType.StaticName,
    };
    this.contentImportDialogRef = this.dialog.open(ContentImportComponent, {
      backdropClass: 'content-import-dialog-backdrop',
      panelClass: ['content-import-dialog-panel', 'dialog-panel-medium'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      data: dialogData,
    });
    this.subscription.add(
      this.contentImportDialogRef.afterClosed().subscribe(() => {
        console.log('Content import dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private openPermissions(contentType: ContentType) {
    const dialogData: PermissionsDialogData = {
      staticName: contentType.StaticName,
      type: 4, // spm figure out what type is
      keyType: 'guid', // spm figure out what keyType is
    };
    this.permissionsDialogRef = this.dialog.open(PermissionsComponent, {
      backdropClass: 'permissions-dialog-backdrop',
      panelClass: ['permissions-dialog-panel', 'dialog-panel-large'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      data: dialogData,
    });
    this.subscription.add(
      this.permissionsDialogRef.afterClosed().subscribe(() => {
        console.log('Permissions dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private deleteContentType(contentType: ContentType) {
    console.log('Delete content type', contentType);
    if (confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) {
      this.contentTypesService.delete(contentType).subscribe(result => {
        this.fetchContentTypes();
      });
    }
  }

  private fetchContentTypes() {
    this.contentTypesService.retrieveContentTypes(this.scope).subscribe(contentTypes => {
      this.contentTypes = contentTypes;
    });
  }

  private refreshOnSubDialogClosed(message: string) {
    this.subscription.add(
      this.dialogService.subToClosed(message).subscribe(event => {
        console.log('Dialog closed event captured');
        this.fetchContentTypes();
      })
    );
  }

  private initChildDialogSub() {
    const child = this.route.firstChild.firstChild;
    if (!child) { return; }
    if (child.snapshot.url.length === 0) { return; }
    let childPath = '';
    child.snapshot.url.forEach((segment, index) => {
      childPath += (index > 0 ? '/' : '') + segment;
    });
    if (childPath.match(/.\/add/)) {
      // ':scope/add'
      this.refreshOnSubDialogClosed(ADD_CONTENT_TYPE_DIALOG_CLOSED);
    } else if (childPath.match(/.\/.\/edit/)) {
      // ':scope/:contentTypeId/edit'
      this.refreshOnSubDialogClosed(EDIT_CONTENT_TYPE_DIALOG_CLOSED);
    }
  }

}
