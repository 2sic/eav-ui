import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ColDef, AllCommunityModules, CellClickedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ContentType } from '../models/content-type.model';
import { ContentTypesService } from '../services/content-types.service';
import { DataItemsComponent } from '../ag-grid-components/data-items/data-items.component';
import { DataFieldsComponent } from '../ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../ag-grid-components/data-actions/data-actions.component';
import { eavConstants, EavScopesKey, EavScopeOption } from '../../shared/constants/eav.constants';
import { DataActionsParams } from '../ag-grid-components/data-actions/data-actions.models';
import { EditForm } from '../models/edit-form.model';
import { GlobalConfigurationService } from '../../../../../edit/shared/services/global-configuration.service';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';

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
      headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
      cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
    },
    {
      headerName: 'Content Type', field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight', sort: 'asc',
      sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.showContentItems.bind(this), valueGetter: this.nameValueGetter,
    },
    {
      headerName: 'Items', field: 'Items', width: 102, headerClass: 'dense', cellClass: 'secondary-action no-padding',
      sortable: true, filter: 'agNumberColumnFilter', cellRenderer: 'dataItemsComponent', onCellClicked: this.addItem.bind(this),
    },
    {
      headerName: 'Fields', field: 'Fields', width: 94, headerClass: 'dense', cellClass: 'secondary-action no-padding',
      sortable: true, filter: 'agNumberColumnFilter', cellRenderer: 'dataFieldsComponent', onCellClicked: this.editFields.bind(this),
    },
    {
      width: 240, cellClass: 'secondary-action no-padding', cellRenderer: 'dataActionsComponent',
      cellRendererParams: {
        enableAppFeaturesGetter: this.enableAppFeaturesGetter.bind(this),
        onEdit: this.editContentType.bind(this),
        onCreateOrEditMetadata: this.createOrEditMetadata.bind(this),
        onOpenExport: this.openExport.bind(this),
        onOpenImport: this.openImport.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteContentType.bind(this),
      } as DataActionsParams,
    },
    {
      headerName: 'Description', field: 'Description', flex: 2, minWidth: 250, cellClass: 'no-outline',
      sortable: true, filter: 'agTextColumnFilter',
    },
  ];
  frameworkComponents = {
    idFieldComponent: IdFieldComponent,
    dataItemsComponent: DataItemsComponent,
    dataFieldsComponent: DataFieldsComponent,
    dataActionsComponent: DataActionsComponent,
  };
  modules = AllCommunityModules;

  private enableAppFeatures = false;
  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private globalConfigurationService: GlobalConfigurationService,
    private appDialogConfigService: AppDialogConfigService,
    private snackBar: MatSnackBar,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild.firstChild;
    this.scope = eavConstants.scopes.default.value;
    this.defaultScope = eavConstants.scopes.default.value;
    // this.scopeOptions = Object.keys(eavConstants.scopes).map((key: EavScopesKey) => eavConstants.scopes[key]);
  }

  async ngOnInit() {
    const dialogSettings = await this.appDialogConfigService.getDialogSettings().toPromise();
    this.enableAppFeatures = !dialogSettings.IsContent;
    this.fetchScopes();
    this.fetchContentTypes();
    this.refreshOnChildClosed();
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

  private showContentItems(params: CellClickedEvent) {
    const contentType = params.data as ContentType;
    this.router.navigate([`items/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.router.navigate([`${this.scope}/add`], { relativeTo: this.route.firstChild });
    } else {
      this.router.navigate([`${this.scope}/${contentType.Id}/edit`], { relativeTo: this.route.firstChild });
    }
  }

  private fetchContentTypes() {
    this.contentTypesService.retrieveContentTypes(this.scope).subscribe(contentTypes => {
      this.contentTypes = contentTypes;
    });
  }

  private fetchScopes() {
    this.contentTypesService.getScopes().subscribe(contentTypes => {
      this.scopeOptions = contentTypes;
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
    if (this.scope !== this.defaultScope) {
      this.snackBar.open(
        'Warning! You are in a special scope. Changing things here could easily break functionality',
        null,
        { duration: 2000 }
      );
    }
  }

  private idValueGetter(params: ValueGetterParams) {
    const contentType: ContentType = params.data;
    return `ID: ${contentType.Id}\nGUID: ${contentType.StaticName}`;
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

  private addItem(params: CellClickedEvent) {
    const contentType = params.data as ContentType;
    const form: EditForm = {
      items: [{ ContentTypeName: contentType.StaticName }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private editFields(params: CellClickedEvent) {
    const contentType = params.data as ContentType;
    if (contentType.UsesSharedDef) { return; }
    this.router.navigate([`fields/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
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
        : [{ EntityId: contentType.Metadata.Id.toString() }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private openExport(contentType: ContentType) {
    this.router.navigate([`export/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  private openImport(contentType: ContentType) {
    this.router.navigate([`${contentType.StaticName}/import`], { relativeTo: this.route.firstChild });
  }

  private openPermissions(contentType: ContentType) {
    this.router.navigate(
      [`permissions/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/${contentType.StaticName}`],
      { relativeTo: this.route.firstChild }
    );
  }

  private deleteContentType(contentType: ContentType) {
    if (!confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) { return; }
    this.snackBar.open(`Deleting...`);
    this.contentTypesService.delete(contentType).subscribe(result => {
      this.snackBar.open(`Deleted`, null, { duration: 2000 });
      this.fetchContentTypes();
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild.firstChild;
        if (!this.hasChild && hadChild) {
          this.fetchContentTypes();
        }
      })
    );
  }

}
