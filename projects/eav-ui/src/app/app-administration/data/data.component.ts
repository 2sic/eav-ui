import { GridOptions } from '@ag-grid-community/core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, from, map, startWith, take } from 'rxjs';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { ContentImportDialogData } from '../../content-import/content-import-dialog.config';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants } from '../../shared/constants/eav.constants';
import { toString } from '../../shared/helpers/file-to-base64.helper';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { ContentType } from '../models/content-type.model';
import { ContentTypesService } from '../services/content-types.service';
import { DataActionsComponent } from './data-actions/data-actions.component';
import { DataActionsParams } from './data-actions/data-actions.models';
import { DataFieldsComponent } from './data-fields/data-fields.component';
import { DataFieldsParams } from './data-fields/data-fields.models';
import { DataItemsComponent } from './data-items/data-items.component';
import { DataItemsParams } from './data-items/data-items.models';
import { ScopeDetailsDto } from '../models/scopedetails.dto';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogActions } from '@angular/material/dialog';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { transient } from '../../core';
import { mapUntilChanged } from '../../shared/rxJs/mapUntilChanged';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { BaseComponent } from '../../shared/components/base.component';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  standalone: true,
  imports: [
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
    DragAndDropDirective,
  ],
})
export class DataComponent extends BaseComponent implements OnInit, OnDestroy {

  isDebug = inject(GlobalConfigService).isDebug;
  #snackBar = inject(MatSnackBar);

  #contentTypeSvc = transient(ContentTypesService);
  #contentExportSvc = transient(ContentExportService);
  #dialogConfigSvc = transient(AppDialogConfigService);
  #dialogRouter = transient(DialogRoutingService);

  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  scope$ = new BehaviorSubject<string>(undefined);

  /** Possible scopes - the ones from the backend + manually entered scopes by the current user */
  scopeOptions$ = new BehaviorSubject<ScopeDetailsDto[]>([]);
  gridOptions = this.#buildGridOptions();
  dropdownInsertValue = dropdownInsertValue;
  enablePermissions!: boolean;

  viewModel$ = combineLatest([this.contentTypes$, this.scope$, this.scopeOptions$]).pipe(
    map(([contentTypes, scope, scopeOptions]) =>
      ({ contentTypes, scope, scopeOptions })),
  );

  constructor() {
    super();
  }

  ngOnInit() {
    this.#fetchScopes();
    this.#refreshScopeOnRouteChange();
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchContentTypes());

    this.#dialogConfigSvc.getCurrent$().subscribe(data => {
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
            this.#snackBar.open(message, null, { duration: 5000 });
            return;
          }
          this.#openDataImport(contentType, files);
        });
        break;
      case 'json':
        this.importType(files);
        break;
    }
  }

  importType(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navParentFirstChild(['import'], { state: dialogData });
  }

  #showContentItems(contentType: ContentType) {
    this.#dialogRouter.navParentFirstChild([`items/${contentType.StaticName}`]);
  }

  editContentType(contentType: ContentType) {
    if (!contentType) {
      this.#dialogRouter.navParentFirstChild(['add']);
    } else {
      if (contentType.EditInfo.ReadOnly) { return; }
      this.#dialogRouter.navParentFirstChild([`${contentType.StaticName}/edit`]);
    }
  }

  #fetchContentTypes() {
    this.#contentTypeSvc.retrieveContentTypes(this.scope$.value).subscribe(contentTypes => {
      for (const contentType of contentTypes) {
        contentType._compareLabel = contentType.Label.replace(/\p{Emoji}/gu, 'ž');
      }
      this.contentTypes$.next(contentTypes);
      if (this.scope$.value !== eavConstants.scopes.default.value) {
        const message = 'Warning! You are in a special scope. Changing things here could easily break functionality';
        this.#snackBar.open(message, null, { duration: 2000 });
      }
    });
  }

  #fetchScopes() {
    this.#contentTypeSvc.getScopesV2().subscribe(scopeList => {
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
    this.#snackBar.open('Saving...');
    this.#contentTypeSvc.createGhost(sourceName).subscribe(res => {
      this.#snackBar.open('Saved', null, { duration: 2000 });
      this.#fetchContentTypes();
    });
  }

  changeScope(newScope: string) {
    console.log("trigger")
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
    }
    this.#dialogRouter.navRelative(['..', newScope]);
  }

  //#region Actions in the grid

  #addItem(contentType: ContentType) {
    const form: EditForm = {
      items: [EditPrep.newFromType(contentType.StaticName)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
  }

  #editFields(contentType: ContentType) {
    this.#dialogRouter.navParentFirstChild([`fields/${contentType.StaticName}`]);
  }

  #createOrEditMetadata(contentType: ContentType) {
    const form: EditForm = {
      items: [
        !contentType.Properties
          ? {
              ...EditPrep.newMetadata(contentType.StaticName, eavConstants.contentTypes.contentType, eavConstants.metadata.contentType),
              Prefill: {
                Label: contentType.Name,
                Description: contentType.Description
              },
            }
          : EditPrep.editId(contentType.Properties.Id),
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
  }

  #openMetadata(contentType: ContentType) {
    const url = GoToMetadata.getUrlContentType(
      contentType.StaticName,
      `Metadata for Content Type: ${contentType.Name} (${contentType.Id})`,
    );
    this.#dialogRouter.navParentFirstChild([url]);
  }

  #openRestApi(contentType: ContentType) {
    this.#dialogRouter.navParentFirstChild([GoToDevRest.getUrlData(contentType)]);
  }

  #exportType(contentType: ContentType) {
    this.#contentExportSvc.exportJson(contentType.StaticName);
  }

  #openDataExport(contentType: ContentType) {
    this.#dialogRouter.navParentFirstChild([`export/${contentType.StaticName}`]);
  }

  #openDataImport(contentType: ContentType, files?: File[]) {
    const contentImportData: ContentImportDialogData = { files };
    this.#dialogRouter.navParentFirstChild([`${contentType.StaticName}/import`], { state: contentImportData });
  }

  #openPermissions(contentType: ContentType) {
    this.#dialogRouter.navParentFirstChild([GoToPermissions.getUrlContentType(contentType.StaticName)]);
  }

  #deleteContentType(contentType: ContentType) {
    if (!confirm(`Are you sure you want to delete '${contentType.Name}' (${contentType.Id})?`)) { return; }
    this.#snackBar.open('Deleting...');
    this.#contentTypeSvc.delete(contentType).subscribe(result => {
      this.#snackBar.open('Deleted', null, { duration: 2000 });
      this.#fetchContentTypes();
    });
  }

  //#endregion

  /**
   * Refreshes the scope when the route changes.
   * ...also adds a scope name if the route scope is not found in the list of possible scopes.
   * This is to allow an admin to enter a custom scope.
   * Note 2024-03-04 2dm - not sure if this auto-add feature is still needed though...
   */
  #refreshScopeOnRouteChange() {
    this.subscriptions.add(
      this.#dialogRouter.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.#dialogRouter.snapshot.paramMap.get('scope')),
        startWith(this.#dialogRouter.snapshot.paramMap.get('scope')),
        filter(scope => !!scope),
        mapUntilChanged(m => m),
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
        this.#fetchContentTypes();
      })
    );
  }

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<ContentType>('StaticName'),
        },
        {
          ...ColumnDefinitions.TextWideType,
          headerName: 'ContentType',
          field: 'Label',
          sort: 'asc',
          onCellClicked: (params) => {
            const contentType: ContentType = params.data;
            this.#showContentItems(contentType);
          },
          comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
            const contentTypeA: ContentType = nodeA.data;
            const contentTypeB: ContentType = nodeB.data;
            return contentTypeA._compareLabel.localeCompare(contentTypeB._compareLabel);
          },
        },
        {
          ...ColumnDefinitions.Items,
          field: 'Items',
          cellRenderer: DataItemsComponent,
          cellRendererParams: (() => {
            const params: DataItemsParams = {
              onShowItems: (contentType) => this.#showContentItems(contentType),
              onAddItem: (contentType) => this.#addItem(contentType),
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.Fields,
          field: 'Fields',
          cellRenderer: DataFieldsComponent,
          cellRendererParams: (() => {
            const params: DataFieldsParams = {
              onEditFields: (contentType) => this.#editFields(contentType),
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          field: 'Name',
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
          ...ColumnDefinitions.TextWideFlex3,
          field: 'Description',
          valueGetter: (params) => {
            const contentType: ContentType = params.data;
            return contentType.Properties?.Description;
          },
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight4,
          cellRenderer: DataActionsComponent,
          cellRendererParams: (() => {
            const params: DataActionsParams = {
              enablePermissionsGetter: () => this.enablePermissions,
              do: (verb, contentType) => {
                switch (verb) {
                  case 'createUpdateMetaData': this.#createOrEditMetadata(contentType); break;
                  case 'openPermissions': this.#openPermissions(contentType); break;
                  case 'editContentType': this.editContentType(contentType); break;
                  case 'openMetadata': this.#openMetadata(contentType); break;
                  case 'openRestApi': this.#openRestApi(contentType); break;
                  case 'typeExport': this.#exportType(contentType); break;
                  case 'dataExport': this.#openDataExport(contentType); break;
                  case 'dataImport': this.#openDataImport(contentType); break;
                  case 'deleteContentType': this.#deleteContentType(contentType); break;
                }
              }
            } satisfies DataActionsParams;
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
