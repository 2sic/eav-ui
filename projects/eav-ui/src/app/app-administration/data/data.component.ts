import { GridOptions } from '@ag-grid-community/core';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, from, map, startWith, take } from 'rxjs';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { ContentImportDialogData } from '../../content-import/content-import-dialog.config';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../shared/constants/eav.constants';
import { toString } from '../../shared/helpers/file-to-base64.helper';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { ContentType } from '../models/content-type.model';
import { ContentTypesService } from '../services/content-types.service';
import { DataActionsComponent } from './data-actions/data-actions.component';
import { DataActionsParams } from './data-actions/data-actions.models';
import { DataFieldsComponent } from './data-fields/data-fields.component';
import { DataFieldsParams } from './data-fields/data-fields.models';
import { DataItemsComponent } from './data-items/data-items.component';
import { DataItemsParams } from './data-items/data-items.models';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() enablePermissions: boolean;

  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  scope$ = new BehaviorSubject<string>(undefined);
  scopeOptions$ = new BehaviorSubject<ScopeOption[]>([]);
  gridOptions = this.buildGridOptions();
  dropdownInsertValue = dropdownInsertValue;

  viewModel$ = combineLatest([this.contentTypes$, this.scope$, this.scopeOptions$, this.globalConfigService.getDebugEnabled$()]).pipe(
    map(([contentTypes, scope, scopeOptions, debugEnabled]) =>
      ({ contentTypes, scope, scopeOptions, debugEnabled })),
  );

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private globalConfigService: GlobalConfigService,
    private snackBar: MatSnackBar,
    private contentExportService: ContentExportService,
  ) { 
    super(router, route);
  }

  ngOnInit() {
    this.fetchScopes();
    this.refreshScopeOnRouteChange();
    this.subscription.add(this.refreshOnChildClosedDeep().subscribe(() => { this.fetchContentTypes(); }));
  }

  ngOnDestroy() {
    this.contentTypes$.complete();
    this.scope$.complete();
    this.scopeOptions$.complete();
    super.ngOnDestroy();
  }

  filesDropped(files: File[]) {
    const importFile = files[0];
    const ext = importFile.name.substring(importFile.name.lastIndexOf('.') + 1).toLocaleLowerCase();
    switch (ext) {
      case 'xml':
        from(toString(files[0])).pipe(take(1)).subscribe(fileString => {
          const contentTypeName = fileString.split('<Entity Type="')[1]?.split('"')[0];
          const contentType = this.contentTypes$.value.find(ct => ct.Name === contentTypeName);
          if (contentType == null) {
            const message = `Cannot find Content Type named '${contentTypeName}'. Please open Content Type Import dialog manually.`;
            this.snackBar.open(message, null, { duration: 5000 });
            return;
          }
          this.openDataImport(contentType, files);
        });
        break;
      case 'json':
        this.importType(files);
        break;
    }
  }

  importType(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: dialogData });
  }

  private showContentItems(contentType: ContentType) {
    this.router.navigate([`items/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.router.navigate(['add'], { relativeTo: this.route.firstChild });
    } else {
      if (contentType.EditInfo.ReadOnly) { return; }
      this.router.navigate([`${contentType.StaticName}/edit`], { relativeTo: this.route.firstChild });
    }
  }

  private fetchContentTypes() {
    this.contentTypesService.retrieveContentTypes(this.scope$.value).subscribe(contentTypes => {
      for (const contentType of contentTypes) {
        contentType._compareLabel = contentType.Label.replace(/\p{Emoji}/gu, 'ž');
      }
      this.contentTypes$.next(contentTypes);
      if (this.scope$.value !== eavConstants.scopes.default.value) {
        const message = 'Warning! You are in a special scope. Changing things here could easily break functionality';
        this.snackBar.open(message, null, { duration: 2000 });
      }
    });
  }

  private fetchScopes() {
    this.contentTypesService.getScopes().subscribe(scopeOptions => {
      const newScopes = [...this.scopeOptions$.value];
      scopeOptions.forEach(scopeOption => {
        const existing = newScopes.find(scope => scope.value === scopeOption.value);
        if (existing) {
          existing.name = scopeOption.name;
        } else {
          newScopes.push(scopeOption);
        }
      });
      this.scopeOptions$.next(newScopes);
    });
  }

  createGhost() {
    const sourceName = window.prompt('To create a ghost content-type enter source static name / id - this is a very advanced operation - read more about it on 2sxc.org/help?tag=ghost');
    if (!sourceName) { return; }
    this.snackBar.open('Saving...');
    this.contentTypesService.createGhost(sourceName).subscribe(res => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchContentTypes();
    });
  }

  changeScope(newScope: string) {
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
    }
    this.router.navigate([`data/${newScope}`], { relativeTo: this.route });
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private addItem(contentType: ContentType) {
    const form: EditForm = {
      items: [{ ContentTypeName: contentType.StaticName }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private editFields(contentType: ContentType) {
    this.router.navigate([`fields/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  private createOrEditMetadata(contentType: ContentType) {
    const form: EditForm = {
      items: [
        !contentType.Properties
          ? {
            ContentTypeName: eavConstants.contentTypes.contentType,
            For: {
              Target: eavConstants.metadata.contentType.target,
              TargetType: eavConstants.metadata.contentType.targetType,
              String: contentType.StaticName,
            },
            Prefill: { Label: contentType.Name, Description: contentType.Description },
          }
          : { EntityId: contentType.Properties.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private openMetadata(contentType: ContentType) {
    const url = GoToMetadata.getUrlContentType(
      contentType.StaticName,
      `Metadata for Content Type: ${contentType.Name} (${contentType.Id})`,
    );
    this.router.navigate([url], { relativeTo: this.route.firstChild });
  }

  private openRestApi(contentType: ContentType) {
    this.router.navigate([GoToDevRest.getUrlData(contentType)], { relativeTo: this.route.firstChild });
  }

  private exportType(contentType: ContentType) {
    this.contentExportService.exportJson(contentType.StaticName);
  }

  private openDataExport(contentType: ContentType) {
    this.router.navigate([`export/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  private openDataImport(contentType: ContentType, files?: File[]) {
    const contentImportData: ContentImportDialogData = { files };
    this.router.navigate([`${contentType.StaticName}/import`], { relativeTo: this.route.firstChild, state: contentImportData });
  }

  private openPermissions(contentType: ContentType) {
    this.router.navigate([GoToPermissions.getUrlContentType(contentType.StaticName)], { relativeTo: this.route.firstChild });
  }

  private deleteContentType(contentType: ContentType) {
    if (!confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.contentTypesService.delete(contentType).subscribe(result => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchContentTypes();
    });
  }

  private refreshScopeOnRouteChange() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route.snapshot.firstChild.paramMap.get('scope')),
        startWith(this.route.snapshot.firstChild.paramMap.get('scope')),
        filter(scope => !!scope),
        distinctUntilChanged(),
      ).subscribe(scope => {
        this.scope$.next(scope);
        if (!this.scopeOptions$.value.map(option => option.value).includes(scope)) {
          const newScopeOption: ScopeOption = {
            name: scope,
            value: scope,
          };
          this.scopeOptions$.next([...this.scopeOptions$.value, newScopeOption]);
        }
        this.fetchContentTypes();
      })
    );
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          sortable: true,
          filter: 'agNumberColumnFilter',
          cellClass: (params) => {
            const contentType: ContentType = params.data;
            return `id-action no-padding no-outline ${contentType.EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
          },
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Id;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<ContentType> = {
              tooltipGetter: (contentType) => `ID: ${contentType.Id}\nGUID: ${contentType.StaticName}`,
            };
            return params;
          })(),
        },
        {
          headerName: 'Content Type',
          field: 'ContentType',
          flex: 3,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          onCellClicked: (params) => {
            const contentType: ContentType = params.data;
            this.showContentItems(contentType);
          },
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Label;
          },
          comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
            const contentTypeA: ContentType = nodeA.data;
            const contentTypeB: ContentType = nodeB.data;
            return contentTypeA._compareLabel.localeCompare(contentTypeB._compareLabel);
          },
        },
        {
          field: 'Items',
          width: 102,
          headerClass: 'dense',
          cellClass: 'secondary-action no-padding'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Items;
          },
          cellRenderer: DataItemsComponent,
          cellRendererParams: (() => {
            const params: DataItemsParams = {
              onShowItems: (contentType) => this.showContentItems(contentType),
              onAddItem: (contentType) => this.addItem(contentType),
            };
            return params;
          })(),
        },
        {
          field: 'Fields',
          width: 94,
          headerClass: 'dense',
          cellClass: 'secondary-action no-padding'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Fields;
          },
          cellRenderer: DataFieldsComponent,
          cellRendererParams: (() => {
            const params: DataFieldsParams = {
              onEditFields: (contentType) => this.editFields(contentType),
            };
            return params;
          })(),
        },
        {
          field: 'Name',
          flex: 1,
          minWidth: 100,
          sortable: true,
          filter: 'agTextColumnFilter',
          cellClass: (params) => {
            const contentType: ContentType = params.data;
            return `${contentType.EditInfo.DisableEdit ? 'no-outline' : 'primary-action highlight'}`.split(' ');
          },
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Name;
          },
          onCellClicked: (params) => {
            const contentType: ContentType = params.data;
            this.editContentType(contentType);
          },
        },
        {
          field: 'Description',
          flex: 3,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Properties?.Description;
          },
        },
        {
          width: 162,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: DataActionsComponent,
          cellRendererParams: (() => {
            const params: DataActionsParams = {
              enablePermissionsGetter: () => this.enablePermissionsGetter(),
              onCreateOrEditMetadata: (contentType) => this.createOrEditMetadata(contentType),
              onOpenPermissions: (contentType) => this.openPermissions(contentType),
              onEdit: (contentType) => this.editContentType(contentType),
              onOpenRestApi: (contentType) => this.openRestApi(contentType),
              onOpenMetadata: (contentType) => this.openMetadata(contentType),
              onTypeExport: (contentType) => this.exportType(contentType),
              onOpenDataExport: (contentType) => this.openDataExport(contentType),
              onOpenDataImport: (contentType) => this.openDataImport(contentType),
              onDelete: (contentType) => this.deleteContentType(contentType),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
