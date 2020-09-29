import { AllCommunityModules, CellClassParams, CellClickedEvent, GridOptions, ValueGetterParams } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, from, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith, take } from 'rxjs/operators';
import { GlobalConfigService } from '../../../../../edit/shared/services/global-configuration.service';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { ContentImportDialogData } from '../../content-import/content-import-dialog.config';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants, EavScopeOption } from '../../shared/constants/eav.constants';
import { toString } from '../../shared/helpers/file-to-base64.helper';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { DataActionsComponent } from '../ag-grid-components/data-actions/data-actions.component';
import { DataActionsParams } from '../ag-grid-components/data-actions/data-actions.models';
import { DataFieldsComponent } from '../ag-grid-components/data-fields/data-fields.component';
import { DataItemsComponent } from '../ag-grid-components/data-items/data-items.component';
import { ContentType } from '../models/content-type.model';
import { ContentTypesService } from '../services/content-types.service';
import { ImportContentTypeDialogData } from '../sub-dialogs/import-content-type/import-content-type-dialog.config';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataComponent implements OnInit, OnDestroy {
  @Input() private enablePermissions: boolean;

  contentTypes$ = new BehaviorSubject<ContentType[]>(null);
  scope = eavConstants.scopes.default.value;
  defaultScope = eavConstants.scopes.default.value;
  scopeOptions$ = new BehaviorSubject<EavScopeOption[]>([]);
  debugEnabled$ = this.globalConfigService.getDebugEnabled();

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      dataItemsComponent: DataItemsComponent,
      dataFieldsComponent: DataFieldsComponent,
      dataActionsComponent: DataActionsComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
      },
      {
        headerName: 'Content Type', field: 'Label', flex: 3, minWidth: 250, cellClass: 'primary-action highlight', sort: 'asc',
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.showContentItems.bind(this),
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
        headerName: 'Name', field: 'Name', flex: 1, minWidth: 100, cellClass: this.nameCellClassGetter.bind(this),
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: (event) => { this.editContentType(event.data); },
      },
      {
        headerName: 'Description', field: 'Metadata.Description', flex: 3, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        width: 120, cellClass: 'secondary-action no-padding', cellRenderer: 'dataActionsComponent', pinned: 'right',
        cellRendererParams: {
          enablePermissionsGetter: this.enablePermissionsGetter.bind(this),
          onCreateOrEditMetadata: this.createOrEditMetadata.bind(this),
          onOpenPermissions: this.openPermissions.bind(this),
          onEdit: this.editContentType.bind(this),
          onTypeExport: this.exportType.bind(this),
          onOpenDataExport: this.openDataExport.bind(this),
          onOpenDataImport: this.openDataImport.bind(this),
          onDelete: this.deleteContentType.bind(this),
        } as DataActionsParams,
      },
    ],
  };

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private globalConfigService: GlobalConfigService,
    private snackBar: MatSnackBar,
    private contentExportService: ContentExportService,
  ) { }

  ngOnInit() {
    this.fetchContentTypes();
    this.fetchScopes();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.contentTypes$.complete();
    this.scopeOptions$.complete();
    this.subscription.unsubscribe();
  }

  filesDropped(files: File[]) {
    const importFile = files[0];
    const ext = importFile.name.substring(importFile.name.lastIndexOf('.') + 1).toLocaleLowerCase();
    switch (ext) {
      case 'xml':
        from(toString(files[0])).pipe(take(1)).subscribe(fileString => {
          const contentTypeName = fileString.split('<Entity Type="')[1].split('"')[0];
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
    const importContentTypeData: ImportContentTypeDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: importContentTypeData });
  }

  private showContentItems(params: CellClickedEvent) {
    const contentType = params.data as ContentType;
    this.router.navigate([`items/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.router.navigate([`${this.scope}/add`], { relativeTo: this.route.firstChild });
    } else {
      if (contentType.UsesSharedDef) { return; }
      this.router.navigate([`${this.scope}/${contentType.StaticName}/edit`], { relativeTo: this.route.firstChild });
    }
  }

  private fetchContentTypes() {
    this.contentTypesService.retrieveContentTypes(this.scope).subscribe(contentTypes => {
      this.contentTypes$.next(contentTypes);
      if (this.scope !== this.defaultScope) {
        const message = 'Warning! You are in a special scope. Changing things here could easily break functionality';
        this.snackBar.open(message, null, { duration: 2000 });
      }
    });
  }

  private fetchScopes() {
    this.contentTypesService.getScopes().subscribe(scopes => {
      this.scopeOptions$.next(scopes);
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
    if (newScope === 'Other') {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.');
      if (!newScope) {
        newScope = eavConstants.scopes.default.value;
      } else if (!this.scopeOptions$.value.find(option => option.value === newScope)) {
        const newScopeOption: EavScopeOption = {
          name: newScope,
          value: newScope,
        };
        this.scopeOptions$.next([...this.scopeOptions$.value, newScopeOption]);
      }
    }
    this.scope = newScope;
    this.fetchContentTypes();
  }

  private idValueGetter(params: ValueGetterParams) {
    const contentType: ContentType = params.data;
    return `ID: ${contentType.Id}\nGUID: ${contentType.StaticName}`;
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private nameCellClassGetter(params: CellClassParams) {
    const contentType: ContentType = params.data;
    if (contentType.UsesSharedDef) {
      return 'disabled';
    } else {
      return 'primary-action highlight';
    }
  }

  private addItem(params: CellClickedEvent) {
    const contentType = params.data as ContentType;
    const form: EditForm = {
      items: [{ ContentTypeName: contentType.StaticName }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private editFields(params: CellClickedEvent) {
    const contentType = params.data as ContentType;
    if (contentType.UsesSharedDef) { return; }
    this.router.navigate([`fields/${contentType.StaticName}`], { relativeTo: this.route.firstChild });
  }

  private createOrEditMetadata(contentType: ContentType) {
    const form: EditForm = {
      items: [
        !contentType.Metadata
          ? {
            ContentTypeName: eavConstants.contentTypes.contentType,
            For: {
              Target: eavConstants.metadata.contentType.target,
              String: contentType.StaticName,
            },
            Prefill: { Label: contentType.Name, Description: contentType.Description },
          }
          : { EntityId: contentType.Metadata.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
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
    this.router.navigate(
      [`permissions/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/${contentType.StaticName}`],
      { relativeTo: this.route.firstChild }
    );
  }

  private deleteContentType(contentType: ContentType) {
    if (!confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.contentTypesService.delete(contentType).subscribe(result => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchContentTypes();
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchContentTypes();
      })
    );
  }

}
