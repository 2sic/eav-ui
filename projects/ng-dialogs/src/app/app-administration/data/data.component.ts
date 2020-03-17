import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
// tslint:disable-next-line:max-line-length
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { ContentType } from '../shared/models/content-type.model';
import { ContentTypesService } from '../shared/services/content-types.service';
import { DataItemsComponent } from '../shared/ag-grid-components/data-items/data-items.component';
import { DataFieldsComponent } from '../shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../shared/ag-grid-components/data-actions/data-actions.component';
import { eavConstants, EavScopesKey, EavScopeOption } from '../../shared/constants/eav-constants';
import { DataActionsParams } from '../shared/models/data-actions-params';
import { DataItemsParams } from '../shared/models/data-items-params';
import { DataFieldsParams } from '../shared/models/data-fields-params';
import { DialogService } from '../../shared/components/dialog-service/dialog.service';
// tslint:disable-next-line:max-line-length
import { EDIT_CONTENT_TYPE_DIALOG, CONTENT_TYPE_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, ITEMS_EDIT_DIALOG } from '../../shared/constants/dialog-names';
import { EditForm } from '../shared/models/edit-form.model';
import { GlobalConfigurationService } from '../../../../../edit/shared/services/global-configuration.service';
import { AppDialogConfigService } from '../shared/services/app-dialog-config.service';

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
      headerName: 'Name', minWidth: 250, width: 200, cellClass: 'clickable', sortable: true, filter: 'agTextColumnFilter',
      onCellClicked: this.showContentItems.bind(this), valueGetter: this.nameValueGetter,
    },
    {
      headerName: 'Items', field: 'Items', width: 160, suppressSizeToFit: true, sortable: true, filter: 'agNumberColumnFilter',
      cellRenderer: 'dataItemsComponent', cellRendererParams: <DataItemsParams>{
        onAddItem: this.addItem.bind(this),
      },
    },
    {
      headerName: 'Description', field: 'Description', minWidth: 250, width: 200, cellClass: 'clickable',
      sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.showContentItems.bind(this),
    },
    {
      headerName: 'Fields', field: 'Fields', width: 160, suppressSizeToFit: true, sortable: true, filter: 'agNumberColumnFilter',
      cellRenderer: 'dataFieldsComponent', cellRendererParams: <DataFieldsParams>{
        onEditFields: this.editFields.bind(this),
      },
    },
    {
      headerName: 'Actions', minWidth: 400, width: 200, cellRenderer: 'dataActionsComponent', cellRendererParams: <DataActionsParams>{
        enableAppFeaturesGetter: this.enableAppFeaturesGetter.bind(this),
        onEdit: this.editContentType.bind(this),
        onCreateOrEditMetadata: this.createOrEditMetadata.bind(this),
        onOpenExport: this.openExport.bind(this),
        onOpenImport: this.openImport.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteContentType.bind(this),
      },
    },
  ];
  frameworkComponents = {
    dataItemsComponent: DataItemsComponent,
    dataFieldsComponent: DataFieldsComponent,
    dataActionsComponent: DataActionsComponent,
  };
  modules = AllCommunityModules;

  private enableAppFeatures = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private contentTypesService: ContentTypesService,
    private globalConfigurationService: GlobalConfigurationService,
    private appDialogConfigService: AppDialogConfigService,
  ) {
    this.scope = eavConstants.scopes.default.value;
    this.defaultScope = eavConstants.scopes.default.value;
    this.scopeOptions = Object.keys(eavConstants.scopes).map((key: EavScopesKey) => eavConstants.scopes[key]);
  }

  async ngOnInit() {
    const dialogSettings = await this.appDialogConfigService.getDialogSettings().toPromise();
    this.enableAppFeatures = !dialogSettings.IsContent;
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

  private nameValueGetter(params: ValueGetterParams) {
    const contentType: ContentType = params.data;
    if (contentType.Name !== contentType.Label) {
      return `${contentType.Label} (${contentType.Name})`;
    } else {
      return contentType.Name;
    }
  }

  private enableAppFeaturesGetter() {
    return this.enableAppFeatures;
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
    const form: EditForm = {
      items: !contentType.Metadata
        ? [{
          ContentTypeName: eavConstants.contentTypes.contentType,
          For: {
            Target: eavConstants.metadata.contentType.target,
            String: contentType.StaticName,
          },
          Prefill: { Label: contentType.Name, Description: contentType.Description },
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
