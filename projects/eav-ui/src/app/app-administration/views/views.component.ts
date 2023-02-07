import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { GridOptions } from '@ag-grid-community/core';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { DialogService } from '../../shared/services/dialog.service';
import { Polymorphism } from '../models/polymorphism.model';
import { View } from '../models/view.model';
import { ViewsService } from '../services/views.service';
import { ViewsActionsComponent } from './views-actions/views-actions.component';
import { ViewActionsParams } from './views-actions/views-actions.models';
import { ViewsShowComponent } from './views-show/views-show.component';
import { ViewsTypeComponent } from './views-type/views-type.component';
import { calculateViewType } from './views.helpers';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss'],
})
export class ViewsComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() enableCode: boolean;
  @Input() enablePermissions: boolean;
  @Input() appIsGlobal: boolean;
  @Input() appIsInherited: boolean;

  views$ = new BehaviorSubject<View[]>(undefined);
  polymorphStatus$ = new BehaviorSubject(undefined);
  polymorphLogo = polymorphLogo;
  gridOptions = this.buildGridOptions();

  private polymorphism: Polymorphism;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private viewsService: ViewsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
  ) {
    super(router, route);
   }

  ngOnInit() {
    this.fetchTemplates();
    this.fetchPolymorphism();
    this.subscription.add(this.refreshOnChildClosedDeep().subscribe(() => { 
      this.fetchTemplates();
      this.fetchPolymorphism();
     }));
  }

  ngOnDestroy() {
    this.views$.complete();
    this.polymorphStatus$.complete();
    super.ngOnDestroy();
  }

  importView(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: dialogData });
  }

  private fetchTemplates() {
    this.viewsService.getAll().subscribe(views => {
      this.views$.next(views);
    });
  }

  private fetchPolymorphism() {
    this.viewsService.getPolymorphism().subscribe(polymorphism => {
      this.polymorphism = polymorphism;
      const polymorphStatus = (polymorphism.Id === null)
        ? 'not configured'
        : (polymorphism.Resolver === null ? 'disabled' : 'using ' + polymorphism.Resolver);
      this.polymorphStatus$.next(polymorphStatus);
    });
  }

  editView(view?: View) {
    const form: EditForm = {
      items: [
        view == null
          ? {
            ContentTypeName: eavConstants.contentTypes.template,
            Prefill: {
              ...(this.appIsGlobal && { Location: 'Global' }),
            },
          }
          : { EntityId: view.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  editPolymorphisms() {
    if (!this.polymorphism) { return; }

    const form: EditForm = {
      items: [
        !this.polymorphism.Id
          ? { ContentTypeName: this.polymorphism.TypeName }
          : { EntityId: this.polymorphism.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private openUsage(view: View) {
    this.router.navigate([`usage/${view.Guid}`], { relativeTo: this.route.firstChild });
  }

  private openCode(view: View) {
    this.dialogService.openCodeFile(view.TemplatePath, view.IsShared, view.Id);
  }

  private openPermissions(view: View) {
    this.router.navigate([GoToPermissions.getUrlEntity(view.Guid)], { relativeTo: this.route.firstChild });
  }

  private openMetadata(view: View) {
    const url = GoToMetadata.getUrlEntity(
      view.Guid,
      `Metadata for View: ${view.Name} (${view.Id})`,
    );
    this.router.navigate([url], { relativeTo: this.route.firstChild });
  }

  private cloneView(view: View) {
    const form: EditForm = {
      items: [{ ContentTypeName: eavConstants.contentTypes.template, DuplicateEntity: view.Id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private exportView(view: View) {
    this.viewsService.export(view.Id);
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.viewsService.delete(view.Id).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchTemplates();
    });
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
            const view: View = params.data;
            return `id-action no-padding no-outline ${view.EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
          },
          valueGetter: (params) => {
            const view: View = params.data;
            return view.Id;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<View> = {
              tooltipGetter: (view) => `ID: ${view.Id}\nGUID: ${view.Guid}`,
            };
            return params;
          })(),
        },
        {
          field: 'Show',
          width: 70,
          headerClass: 'dense',
          cellClass: 'no-outline',
          sortable: true,
          filter: BooleanFilterComponent,
          valueGetter: (params) => {
            const view: View = params.data;
            return !view.IsHidden;
          },
          cellRenderer: ViewsShowComponent,
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          onCellClicked: (params) => {
            const view: View = params.data;
            this.editView(view);
          },
          valueGetter: (params) => {
            const view: View = params.data;
            return view.Name;
          },
        },
        {
          field: 'Type',
          width: 82,
          headerClass: 'dense',
          cellClass: 'no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            const type = calculateViewType(view);
            return type.value;
          },
          cellRenderer: ViewsTypeComponent,
        },
        {
          field: 'Used',
          width: 70,
          headerClass: 'dense',
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          onCellClicked: (params) => {
            const view: View = params.data;
            this.openUsage(view);
          },
          valueGetter: (params) => {
            const view: View = params.data;
            return view.Used;
          },
        },
        {
          headerName: 'Url Key',
          field: 'UrlKey',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return view.ViewNameInUrl;
          },
        },
        {
          field: 'Path',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return view.TemplatePath;
          },
        },
        {
          field: 'Content',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return view.ContentType.Name;
          },
        },
        {
          headerName: 'Default',
          field: 'ContentDemo',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return `${view.ContentType.DemoId} ${view.ContentType.DemoTitle}`;
          },
        },
        {
          field: 'Presentation',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return view.PresentationType.Name;
          },
        },
        {
          headerName: 'Default',
          field: 'PresentationDemo',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return `${view.PresentationType.DemoId} ${view.PresentationType.DemoTitle}`;
          },
        },
        {
          field: 'Header',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return view.ListContentType.Name;
          },
        },
        {
          headerName: 'Default',
          field: 'HeaderDemo',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return `${view.ListContentType.DemoId} ${view.ListContentType.DemoTitle}`;
          },
        },
        {
          headerName: 'Header Presentation',
          field: 'HeaderPresentation',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return view.ListPresentationType.Name;
          },
        },
        {
          headerName: 'Default',
          field: 'HeaderPresentationDemo',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const view: View = params.data;
            return `${view.ListPresentationType.DemoId} ${view.ListPresentationType.DemoTitle}`;
          },
        },
        {
          width: 162,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: ViewsActionsComponent,
          cellRendererParams: (() => {
            const params: ViewActionsParams = {
              enableCodeGetter: () => this.enableCodeGetter(),
              enablePermissionsGetter: () => this.enablePermissionsGetter(),
              onOpenCode: (view) => this.openCode(view),
              onOpenPermissions: (view) => this.openPermissions(view),
              onOpenMetadata: (view) => this.openMetadata(view),
              onClone: (view) => this.cloneView(view),
              onExport: (view) => this.exportView(view),
              onDelete: (view) => this.deleteView(view),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
