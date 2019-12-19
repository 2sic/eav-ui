import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { Context } from '../../shared/context/context';
import { ContentType } from '../shared/models/content-type.model';
import { ContentTypesService } from '../shared/services/content-types.service';
import { DataNameComponent } from '../shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from '../shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../shared/ag-grid-components/data-actions/data-actions.component';
import { EditContentTypeComponent } from '../shared/modals/edit-content-type/edit-content-type.component';
import { EditContentTypeDialogData } from '../shared/models/edit-content-type-dialog-data.model';
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

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit, OnDestroy {
  @Input() context: Context;
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
  private subscriptions: Subscription[] = [];
  private editFieldsDialogRef: MatDialogRef<EditFieldsComponent, any>;
  private editContentTypeDialogRef: MatDialogRef<EditContentTypeComponent, any>;
  private contentExportDialogRef: MatDialogRef<ContentExportComponent, any>;
  private contentImportDialogRef: MatDialogRef<ContentImportComponent, any>;
  private permissionsDialogRef: MatDialogRef<PermissionsComponent, any>;

  constructor(
    private dialog: MatDialog,
    private contentTypesService: ContentTypesService,
    private eavConfigurationService: EavConfigurationService,
  ) { }

  ngOnInit() {
    this.scope = this.eavConfigurationService.contentType.defaultScope; // spm figure out how scope works
    this.fetchContentTypes();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
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
      appId: this.context.appId,
      staticName: contentType.StaticName,
    };
    this.editFieldsDialogRef = this.dialog.open(EditFieldsComponent, {
      backdropClass: 'edit-fields-dialog-backdrop',
      panelClass: ['edit-fields-dialog-panel', 'dialog-panel-large'],
      data: dialogData,
    });
    this.subscriptions.push(
      this.editFieldsDialogRef.afterClosed().subscribe(() => {
        console.log('Edit fields dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private editContentType(contentType: ContentType) {
    const dialogData: EditContentTypeDialogData = {
      context: this.context,
      contentType: contentType,
    };
    this.editContentTypeDialogRef = this.dialog.open(EditContentTypeComponent, {
      backdropClass: 'edit-content-type-dialog-backdrop',
      panelClass: ['edit-content-type-dialog-panel', 'dialog-panel-small'],
      data: dialogData,
    });
    this.subscriptions.push(
      this.editContentTypeDialogRef.afterClosed().subscribe(() => {
        console.log('Edit content type dialog was closed.');
        this.fetchContentTypes();
      }),
    );
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
      appId: this.context.appId,
      staticName: contentType.StaticName,
    };
    this.contentExportDialogRef = this.dialog.open(ContentExportComponent, {
      backdropClass: 'content-export-dialog-backdrop',
      panelClass: ['content-export-dialog-panel', 'dialog-panel-medium'],
      data: dialogData,
    });
    this.subscriptions.push(
      this.contentExportDialogRef.afterClosed().subscribe(() => {
        console.log('Content export dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private openImport(contentType: ContentType) {
    const dialogData: ContentImportDialogData = {
      appId: this.context.appId,
      staticName: contentType.StaticName,
    };
    this.contentImportDialogRef = this.dialog.open(ContentImportComponent, {
      backdropClass: 'content-import-dialog-backdrop',
      panelClass: ['content-import-dialog-panel', 'dialog-panel-medium'],
      data: dialogData,
    });
    this.subscriptions.push(
      this.contentImportDialogRef.afterClosed().subscribe(() => {
        console.log('Content import dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private openPermissions(contentType: ContentType) {
    const dialogData: PermissionsDialogData = {
      appId: this.context.appId,
      staticName: contentType.StaticName,
      type: 4, // spm figure out what type is
      keyType: 'guid', // spm figure out what keyType is
    };
    this.permissionsDialogRef = this.dialog.open(PermissionsComponent, {
      backdropClass: 'permissions-dialog-backdrop',
      panelClass: ['permissions-dialog-panel', 'dialog-panel-large'],
      data: dialogData,
    });
    this.subscriptions.push(
      this.permissionsDialogRef.afterClosed().subscribe(() => {
        console.log('Permissions dialog was closed.');
        this.fetchContentTypes();
      }),
    );
  }

  private deleteContentType(contentType: ContentType) {
    console.log('Delete content type', contentType);
    if (confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) {
      this.contentTypesService.delete(contentType, this.context.appId).subscribe((result: boolean) => {
        this.fetchContentTypes();
      });
    }
  }

  private fetchContentTypes() {
    this.contentTypesService.retrieveContentTypes(this.context.appId, this.scope)
      .subscribe((contentTypes: ContentType[]) => {
        this.contentTypes = contentTypes;
      });
  }

}
