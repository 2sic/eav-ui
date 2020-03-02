import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { ContentType } from '../shared/models/content-type.model';
import { ContentTypesService } from '../shared/services/content-types.service';
import { DataNameComponent } from '../shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from '../shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../shared/ag-grid-components/data-actions/data-actions.component';
import { eavConstants, EavScopesKey, EavScopeOption } from '../../shared/constants/eav-constants';
import { DataActionsParams } from '../shared/models/data-actions-params';
import { DataNameParams } from '../shared/models/data-name-params';
import { DataFieldsParams } from '../shared/models/data-fields-params';
import { DialogService } from '../../shared/components/dialog-service/dialog.service';
// tslint:disable-next-line:max-line-length
import { EDIT_CONTENT_TYPE_DIALOG, CONTENT_TYPE_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, ITEMS_EDIT_DIALOG } from '../../shared/constants/dialog-names';
import { EditForm } from '../shared/models/edit-form.model';
import { GlobalConfigurationService } from '../../../../../edit/shared/services/global-configuration.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit, OnDestroy {
  contentTypes: ContentType[];
  scope: string;
  defaultScope: string;
  scopeOptions: EavScopeOption[];
  debugEnabled = false;

  columnDefs: ColDef[] = [
    {
      headerName: 'Name', field: 'Name', cellClass: 'clickable-with-button', cellRenderer: 'dataNameComponent',
      onCellClicked: this.showContentItems.bind(this), cellRendererParams: <DataNameParams>{
        onAddItem: this.addItem.bind(this),
      }
    },
    { headerName: 'Description', field: 'Description', cellClass: 'clickable', onCellClicked: this.showContentItems.bind(this) },
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

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private contentTypesService: ContentTypesService,
    private globalConfigurationService: GlobalConfigurationService,
  ) {
    this.scope = eavConstants.scopes.default.value;
    this.defaultScope = eavConstants.scopes.default.value;
    this.scopeOptions = Object.keys(eavConstants.scopes).map((key: EavScopesKey) => eavConstants.scopes[key]);
  }

  ngOnInit() {
    this.fetchContentTypes();
    this.refreshOnClosedChildDialogs();
    this.subscription.add(
      this.globalConfigurationService.getDebugEnabled().subscribe(debugEnabled => {
        this.debugEnabled = debugEnabled;
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

  showContentItems(params: CellClickedEvent) {
    const contentType = <ContentType>params.data;
    this.router.navigate([`${contentType.StaticName}/items`], { relativeTo: this.route.firstChild });
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
    // tslint:disable-next-line:max-line-length
    const sourceName = window.prompt('To create a ghost content-type enter source static name / id - this is a very advanced operation - read more about it on 2sxc.org/help?tag=ghost');
    if (!sourceName) { return; }
    this.contentTypesService.createGhost(sourceName).subscribe(res => {
      this.fetchContentTypes();
    });
  }

  changeScope(event: MatSelectChange) {
    let newScope: string = event.value;
    if (newScope === 'Other') {
      // tslint:disable-next-line:max-line-length
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.');
      if (!newScope) {
        newScope = eavConstants.scopes.default.value;
      } else if (!this.scopeOptions.find(option => option.value === newScope)) {
        const newScopeOption: EavScopeOption = {
          name: newScope,
          value: newScope,
        };
        this.scopeOptions.push(newScopeOption);
      }
    }
    this.scope = newScope;
    this.fetchContentTypes();
  }

  private addItem(contentType: ContentType) {
    const form: EditForm = {
      items: [{ ContentTypeName: contentType.StaticName }],
      persistedData: null,
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private editFields(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/fields`], { relativeTo: this.route.firstChild });
  }

  private createOrEditMetadata(contentType: ContentType) {
    /*
      // spm fix prefill
      {
        ContentTypeName: 'ContentType',
        Metadata: {
          Key: item.StaticName,
          KeyType: "string",
          TargetType: eavConfig.metadataOfContentType
        },
        Title: title,
        Prefill: { Label: item.Name, Description: item.Description }
      }
    */
    const form: EditForm = {
      items: !contentType.Metadata
        ? [{
          ContentTypeName: eavConstants.contentTypes.contentType,
          For: {
            Target: eavConstants.metadata.contentType.target,
            String: contentType.StaticName,
          },
        }]
        : [{ EntityId: contentType.Metadata.Id.toString(), Title: contentType.Metadata.Title }],
      persistedData: null,
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private openExport(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/export`], { relativeTo: this.route.firstChild });
  }

  private openImport(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/import`], { relativeTo: this.route.firstChild });
  }

  private openPermissions(contentType: ContentType) {
    this.router.navigate(
      [`${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/${contentType.StaticName}/permissions`],
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
          EDIT_CONTENT_TYPE_DIALOG,
          CONTENT_TYPE_FIELDS_DIALOG,
          EXPORT_CONTENT_TYPE_DIALOG,
          IMPORT_CONTENT_TYPE_DIALOG,
          SET_PERMISSIONS_DIALOG,
          ITEMS_EDIT_DIALOG,
        ])
        .subscribe(closedDialog => {
          console.log('Dialog closed event captured:', closedDialog);
          this.fetchContentTypes();
        })
    );
  }

}
