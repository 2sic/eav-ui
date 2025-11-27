import { FilterChangedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, RowClassParams, RowDragEvent, SortChangedEvent } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component, computed, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../../../core';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ConfirmDeleteDialogComponent } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { AgGridHelper } from '../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { GridWithHelpComponent, HelpTextConst } from '../shared/ag-grid/grid-with-help/grid-with-help.component';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { ToggleDebugDirective } from '../shared/directives/toggle-debug.directive';
import { ContentTypesFieldsService } from '../shared/fields/content-types-fields.service';
import { Field } from '../shared/fields/field.model';
import { InputTypeHelpers } from '../shared/fields/input-type-helpers';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep, ItemAddIdentifier, ItemEditIdentifier, ItemIdentifier } from '../shared/models/edit-form.model';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { ContentTypeFieldsActionsComponent } from './content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions/content-type-fields-actions.models';
import { ContentTypeFieldsDragComponent, ContentTypeFieldsDragParams } from './content-type-fields-drag/content-type-fields-drag.component';
import { ContentTypeFieldsSpecialComponent } from './content-type-fields-special/content-type-fields-special.component';
import { ContentTypeFieldsTitleComponent } from './content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTitleParams } from './content-type-fields-title/content-type-fields-title.models';
import { ContentTypeFieldsTypeComponent } from './content-type-fields-type/content-type-fields-type.component';
import { FieldSharingAddMany } from './field-sharing-add-many/field-sharing-add-many.component';
import { ShareOrInheritDialogComponent } from './field-sharing-configure/field-sharing-configure.component';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  styleUrls: ['./content-type-fields.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    NgClass,
    MatDialogActions,
    ToggleDebugDirective,
    SxcGridModule,
    TranslateModule,
    GridWithHelpComponent,
  ]
})
export class ContentTypeFieldsComponent implements OnInit {

  #dialogRouter = transient(DialogRoutingService);
  #contentTypesSvc = transient(ContentTypesService);
  #contentTypesFieldsSvc = transient(ContentTypesFieldsService);

  constructor(
    protected dialog: MatDialogRef<ContentTypeFieldsComponent>,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef, // for dependency injection in the dialog
  ) { }

  #contentTypeStaticName = this.#dialogRouter.getParam('contentTypeStaticName');

  /** Signal to trigger reloading of data */
  refresh = signal(0);

  /** Signal to track if reordering is in progress */
  isReordering = signal(false);

  // UI Help Text for the UX Help Info Card
  #helpTextConst: HelpTextConst = {
    empty: {
      description: '<p><b>This is where you manage Fields</b></p>',
      hint: "<p>Click the (+) in the bottom right corner to create your first Field (think: column).</p>"
    },
    content: {
      description: '<p><b>These are the Fields of this Content-Type</b> <br>They are similar to database columns.</p>',
      hint: '<p>Click on the <em>Name</em> to configure it or on the <em>Input</em> to change the type. <br><br>You can also create new fields, share field definitions, manage field metadata/permissions or rename fields.</p>'
    }
  };

  uxHelpText = computed(() => {
    const data = this.fields();
    return data?.length === 0 ? this.#helpTextConst.empty : this.#helpTextConst.content;
  })

  contentType = this.#contentTypesSvc.getType(this.#contentTypeStaticName).value;

  fields = signal<Field[]>(undefined);

  gridOptions = this.#buildGridOptions();
  sortApplied = false;
  filterApplied = false;

  #gridApi: GridApi;
  #rowDragSuppressed = false;

  ngOnInit() {
    this.#fetchFields();
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchFields());
  }

  onGridReady(params: GridReadyEvent) {
    this.#gridApi = params.api;
  }

  onRowDragEnter(_: RowDragEvent) {
    this.#gridApi.setGridOption("enableCellTextSelection", false);
  }

  onRowDragEnd(_: RowDragEvent) {
    this.#gridApi.setGridOption("suppressRowDrag", true);
    this.isReordering.set(true);

    const idArray = this.fields().map(field => field.Id);
    this.#contentTypesFieldsSvc.reOrder(idArray, this.contentType()).subscribe(() => {
      this.#fetchFields(() => {
        this.#gridApi.setGridOption("enableCellTextSelection", true);
        this.#gridApi.setGridOption("suppressRowDrag", false);
        this.isReordering.set(false);
      });
    });
  }

  onRowDragMove(event: RowDragEvent) {
    const overNode = event.overNode as { data: Field };
    if (!overNode) return;
    const movingNode = event.node as { data: Field };
    if (movingNode === overNode) return;

    const newFields = [...this.fields()];
    const fromIndex = newFields.indexOf(movingNode.data);
    const toIndex = newFields.indexOf(overNode.data);
    const reordered = this.#moveInArray(newFields, fromIndex, toIndex);
    this.fields.set(reordered);
    this.#gridApi.clearFocusedCell();
  }

  #moveInArray(arr: Field[], fromIndex: number, toIndex: number) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    return [...arr];
  }

  onSortChanged(_: SortChangedEvent) {
    const columnStates = this.#gridApi.getColumnState();
    this.sortApplied = columnStates.some(state => state.sort != null);
    this.#suppressRowDrag();
  }

  onFilterChanged(_: FilterChangedEvent) {
    const filterModel = this.#gridApi.getFilterModel();
    const fieldsFiltered = Object.keys(filterModel);
    this.filterApplied = fieldsFiltered.length > 0;
    this.#suppressRowDrag();
  }

  #suppressRowDrag() {
    const shouldSuppress = this.sortApplied || this.filterApplied;

    if (shouldSuppress && !this.#rowDragSuppressed) {
      this.#rowDragSuppressed = true;
      this.#gridApi.setGridOption("suppressRowDrag", true);
    } else if (!shouldSuppress && this.#rowDragSuppressed) {
      this.#rowDragSuppressed = false;
      this.#gridApi.setGridOption("suppressRowDrag", false);
    }
  }

  add() {
    this.#dialogRouter.navRelative([`add/${this.#contentTypeStaticName}`]);
  }

  addSharedField() {
    this.matDialog.open(FieldSharingAddMany, {
      autoFocus: false,
      width: '1600px',
      data: { contentType: this.contentType(), existingFields: this.fields() },
      viewContainerRef: this.viewContainerRef, // for dependency injection in the dialog
    }).afterClosed().subscribe(() => this.#fetchFields());
  }

  #nameCellRenderer(params: Omit<ICellRendererParams, 'data'> & { data: Field }) {
    const inputType = params.data.InputType;

    if (InputTypeHelpers.endsPreviousGroup(inputType))
      return params.value;

    let isGroupOpen = false;
    for (const field of this.fields()) {
      if (InputTypeHelpers.isGroupStart(inputType)) {
        isGroupOpen = true;
        continue;
      }
      if (InputTypeHelpers.isGroupEnd(inputType)) {
        isGroupOpen = false;
        continue;
      }
      if (field.StaticName === params.data.StaticName)
        break;
    }

    return isGroupOpen ? `<span class="is-in-group">${params.value}</span>` : params.value;
  }

  #fetchFields(callback?: () => void) {
    this.#contentTypesFieldsSvc.getFieldsPromise(this.#contentTypeStaticName).then(fields => {
      this.fields.set(fields);
      if (callback != null)
        callback();
    });
  }

  #createItemDefinition(field: Field, metadataType: string): ItemAddIdentifier | ItemEditIdentifier {
    // The keys could start with an @ but may not, and in some cases we need it, others we don't
    const keyForMdLookup = metadataType.replace('@', '');
    const newItemTypeName = ('@' + metadataType).replace('@@', '@');

    // Is an item of this type already loaded? Then just edit it, otherwise request new as Metadata
    const existingMd = field.Metadata[keyForMdLookup];
    return existingMd != null
      ? EditPrep.editId(existingMd.Id) // if defined, return the entity-number to edit
      : {
        ...EditPrep.newMetadata(field.Id, newItemTypeName, eavConstants.metadata.attribute),
        Prefill: { Name: field.StaticName },
      };
  }

  #setTitle(field: Field) {
    this.snackBar.open('Setting title...');
    this.#contentTypesFieldsSvc.setTitle(field, this.contentType()).subscribe(() => {
      this.snackBar.open('Title set', null, { duration: 2000 });
      this.#fetchFields();
    });
  }

  #rename(field: Field) {
    this.#dialogRouter.navRelative([`update/${this.#contentTypeStaticName}/${field.Id}/name`]);
  }

  #delete(field: Field) {
    this.matDialog.open(ConfirmDeleteDialogComponent, {
      autoFocus: false,
      data: {
        entityId: field.Id,
        entityTitle: field.StaticName,
        message: "Delete Item?",
        hasDeleteSnackbar: true
      },
      viewContainerRef: this.viewContainerRef,
      width: '600px',
    }).afterClosed().subscribe(isConfirmed => {
      if (!isConfirmed) return;
      this.#contentTypesFieldsSvc.delete(field, this.contentType()).subscribe(() => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.#fetchFields();
      });
    })
  }

  #openPermissions(field: Field) {
    this.#dialogRouter.navRelative([GoToPermissions.getUrlAttribute(field.Id)]);
  }

  #openImageConfiguration(field: Field) {
    const imgConfig = field.imageConfiguration;
    if (imgConfig?.isRecommended != true)
      throw new Error('This field does not expect to have an image configuration');

    const itemIdentifier: ItemIdentifier = imgConfig.entityId
      ? EditPrep.editId(imgConfig.entityId)
      : EditPrep.newMetadata(field.Id, imgConfig.typeName, eavConstants.metadata.attribute);
    const formUrl = convertFormToUrl({ items: [itemIdentifier] });
    this.#dialogRouter.navRelative([`edit/${formUrl}`]);
  }

  #openMetadata(field: Field) {
    const url = GoToMetadata.getUrlAttribute(
      field.Id,
      `Metadata for Field: ${field.StaticName} (${field.Id})`,
    );
    this.#dialogRouter.navRelative([url]);
  }

  // Add this method - required for the Name column to generate the edit URL for a field
  #fieldEditUrl(field: Field): string {
    const form: EditForm = {
      items: Object.keys(field.ConfigTypes).map((t) => this.#createItemDefinition(field, t))
    };
    const formUrl = convertFormToUrl(form);
    return '#' + this.#dialogRouter.urlSubRoute(`edit/${formUrl}`);
  }

  #inputTypeEditUrl(field: Field): string {
    return '#' + this.#dialogRouter.urlSubRoute(`update/${this.#contentTypeStaticName}/${field.Id}/inputType`);
  }

  #shareOrInherit(field: Field) {
    const shareOrInheritDialogRef = this.matDialog.open(ShareOrInheritDialogComponent, {
      autoFocus: false,
      width: '800px',
      data: field,
      viewContainerRef: this.viewContainerRef, // for dependency injection in the dialog
    });
    shareOrInheritDialogRef.afterClosed().subscribe(() => this.#fetchFields());
  }

  //#region Grid Options

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      getRowClass(params: RowClassParams) {
        const field: Field = params.data;
        const rowClass: string[] = [];
        if (field.EditInfo.DisableSort) { rowClass.push('disable-row-drag'); }
        if (InputTypeHelpers.isGroupStart(field.InputType)) { rowClass.push('group-start-row'); }
        if (InputTypeHelpers.isGroupEnd(field.InputType)) { rowClass.push('group-end-row'); }
        return rowClass;
      },
      columnDefs: [
        {
          rowDrag: true,
          width: 18,
          cellClass: 'no-select no-padding no-outline'.split(' '),
          cellRenderer: ContentTypeFieldsDragComponent,
          cellRendererParams: (() => ({
            isReordering: () => this.isReordering(),
          } satisfies ContentTypeFieldsDragParams))(),
        },
        {
          field: 'Title',
          width: 42,
          cellClass: 'secondary-action no-padding no-outline'.split(' '),
          valueGetter: (p: { data: Field }) => p.data.IsTitle,
          cellRenderer: ContentTypeFieldsTitleComponent,
          cellRendererParams: (() => ({
            onSetTitle: (field) => this.#setTitle(field),
          } satisfies ContentTypeFieldsTitleParams))(),
        },
        {
          ...ColumnDefinitions.TextWidePrimary,
          headerName: 'Name',
          field: 'StaticName',
          cellClass: (p: { data: Field }) => `${p.data.EditInfo.DisableEdit ? 'no-outline' : 'primary-action highlight'}`.split(' '),
          cellRenderer: (params: ICellRendererParams & { data: Field }) =>
            AgGridHelper.cellLink(
              this.#fieldEditUrl(params.data),
              params.value
            ),
        },
        {
          ...ColumnDefinitions.ItemsText,
          field: 'Type',
          width: 70,
          valueGetter: (p: { data: Field }) => p.data.Type,
          cellRenderer: ContentTypeFieldsTypeComponent,
        },
        {
          ...ColumnDefinitions.ItemsText,
          headerName: 'Input',
          field: 'InputType',
          width: 160,
          cellClass: (p: { data: Field }) => `${p.data.EditInfo.DisableEdit ? 'no-outline' : 'primary-action highlight'}`.split(' '),
          valueGetter: (p: { data: Field }) => p.data.InputType.substring(p.data.InputType.indexOf('-') + 1),
          cellRenderer: (params: ICellRendererParams & { data: Field }) =>
            AgGridHelper.cellLink(
              this.#inputTypeEditUrl(params.data),
              params.value
            ),
        },
        {
          field: 'Label',
          flex: 2,
          minWidth: 200,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (p: { data: Field }) => p.data.Metadata?.All?.Name,
        },
        {
          field: 'Special',
          width: 22 * 6, // 6 icons, 22px each
          headerClass: 'dense',
          cellClass: 'no-outline',
          cellRenderer: ContentTypeFieldsSpecialComponent,
        },
        {
          field: 'Notes',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (p: { data: Field }) => p.data.Metadata?.All?.Notes,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight5,
          cellRenderer: ContentTypeFieldsActionsComponent,
          cellRendererParams: (() => ({
            do: (verb, field) => {
              switch (verb) {
                case 'rename': this.#rename(field); break;
                case 'delete': this.#delete(field); break;
                case 'permissions': this.#openPermissions(field); break;
                case 'metadata': this.#openMetadata(field); break;
                case 'shareOrInherit': this.#shareOrInherit(field); break;
                case 'image': this.#openImageConfiguration(field); break;
              }
            }
          } satisfies ContentTypeFieldsActionsParams))(),
        },
      ],
    };
    return gridOptions;
  }

  //#endregion
}