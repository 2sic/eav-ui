import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, from, map, startWith, take } from 'rxjs';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { ContentImportDialogData } from '../../content-import/content-import-dialog.config';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseWithChildDialogComponent } from '../../shared/components/base-component/base-with-child-dialog.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants } from '../../shared/constants/eav.constants';
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
import { ScopeDetailsDto } from '../models/scopedetails.dto';
import { AppDialogConfigService } from '../services';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogActions } from '@angular/material/dialog';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';

@Component({
    selector: 'app-data',
    templateUrl: './data.component.html',
    styleUrls: ['./data.component.scss'],
    standalone: true,
    imports: [
        AgGridModule,
        SharedComponentsModule,
        MatDialogActions,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        RouterOutlet,
        AsyncPipe,
        SxcGridModule,
    ],
})
export class DataComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {

  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  scope$ = new BehaviorSubject<string>(undefined);

  /** Possible scopes - the ones from the backend + manually entered scopes by the current user */
  scopeOptions$ = new BehaviorSubject<ScopeDetailsDto[]>([]);
  gridOptions = this.buildGridOptions();
  dropdownInsertValue = dropdownInsertValue;
  enablePermissions!: boolean;

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
    private dialogConfigSvc: AppDialogConfigService,
  ) {
    super(router, route);

  }

  ngOnInit() {
    this.fetchScopes();
    this.refreshScopeOnRouteChange();
    this.subscriptions.add(this.childDialogClosed$().subscribe(() => { this.fetchContentTypes(); }));

    this.dialogConfigSvc.getCurrent$().subscribe(data => {
      this.enablePermissions = data.Context.Enable.AppPermissions;
    });
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
    this.router.navigate(['import'], { relativeTo: this.route.parent.firstChild, state: dialogData });
  }

  private showContentItems(contentType: ContentType) {
    this.router.navigate([`items/${contentType.StaticName}`], { relativeTo: this.route.parent.firstChild });
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.router.navigate(['add'], { relativeTo: this.route.parent.firstChild });
    } else {
      if (contentType.EditInfo.ReadOnly) { return; }
      this.router.navigate([`${contentType.StaticName}/edit`], { relativeTo: this.route.parent.firstChild });
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
    this.contentTypesService.getScopesV2().subscribe(scopeList => {
      // Merge the new scopes with the existing ones - in case there were manual scopes added
      // If old scope list had a manual scope which the server didn't send, re-add it here
      const manual = this.scopeOptions$.value
        .filter(sOld => scopeList.find(sNew => sNew.name === sOld.name) == null);

      // Add a nice label to each scope containing count-information of types
      const withNiceLabel = scopeList.map(s => {
        let countInfo = !s.typesInherited
          ? `${s.typesTotal} types`               // only not-inherited
          : (s.typesInherited == s.typesTotal)
            ? s.typesInherited + ' sys types'     // only inherited
            : `${s.typesTotal} types / ${s.typesInherited} system`;
        return ({ ...s, label: s.name + ` - ${countInfo}` });
      });

      this.scopeOptions$.next([...withNiceLabel, ...manual]);
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
    console.log("trigger")
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
    }
    this.router.navigate(['..', newScope], { relativeTo: this.route });
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private addItem(contentType: ContentType) {
    const form: EditForm = {
      items: [{ ContentTypeName: contentType.StaticName }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.parent.firstChild });
  }

  private editFields(contentType: ContentType) {
    this.router.navigate([`fields/${contentType.StaticName}`], { relativeTo: this.route.parent.firstChild });
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
              Prefill: {
                Label: contentType.Name,
                Description: contentType.Description
              },
            }
          : { EntityId: contentType.Properties.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.parent.firstChild });
  }

  private openMetadata(contentType: ContentType) {
    const url = GoToMetadata.getUrlContentType(
      contentType.StaticName,
      `Metadata for Content Type: ${contentType.Name} (${contentType.Id})`,
    );
    this.router.navigate([url], { relativeTo: this.route.parent.firstChild });
  }

  private openRestApi(contentType: ContentType) {
    this.router.navigate([GoToDevRest.getUrlData(contentType)], { relativeTo: this.route.parent.firstChild });
  }

  private exportType(contentType: ContentType) {
    this.contentExportService.exportJson(contentType.StaticName);
  }

  private openDataExport(contentType: ContentType) {
    this.router.navigate([`export/${contentType.StaticName}`], { relativeTo: this.route.parent.firstChild });
  }

  private openDataImport(contentType: ContentType, files?: File[]) {
    const contentImportData: ContentImportDialogData = { files };
    this.router.navigate([`${contentType.StaticName}/import`], { relativeTo: this.route.parent.firstChild, state: contentImportData });
  }

  private openPermissions(contentType: ContentType) {
    this.router.navigate([GoToPermissions.getUrlContentType(contentType.StaticName)], { relativeTo: this.route.parent.firstChild });
  }

  private deleteContentType(contentType: ContentType) {
    if (!confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.contentTypesService.delete(contentType).subscribe(result => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchContentTypes();
    });
  }

  /**
   * Refreshes the scope when the route changes.
   * ...also adds a scope name if the route scope is not found in the list of possible scopes.
   * This is to allow an admin to enter a custom scope.
   * Note 2024-03-04 2dm - not sure if this auto-add feature is still needed though...
   */
  private refreshScopeOnRouteChange() {
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route.snapshot.paramMap.get('scope')),
        startWith(this.route.snapshot.paramMap.get('scope')),
        filter(scope => !!scope),
        distinctUntilChanged(),
      ).subscribe(scope => {
        this.scope$.next(scope);

        // If we can't find the scope in the list of options, add it as it was entered manually
        if (!this.scopeOptions$.value.map(option => option.name).includes(scope)) {
          const newScopeOption: ScopeDetailsDto = {
            name: scope,
            label: scope,
            typesTotal: 0,
            typesInherited: 0,
            typesOfApp: 0,
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
