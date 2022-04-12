import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { GridOptions, ValueGetterParams } from '@ag-grid-community/core';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { DialogService } from '../../shared/services/dialog.service';
import { ViewsActionsComponent } from '../ag-grid-components/views-actions/views-actions.component';
import { ViewActionsParams } from '../ag-grid-components/views-actions/views-actions.models';
import { ViewsShowComponent } from '../ag-grid-components/views-show/views-show.component';
import { ViewsTypeComponent } from '../ag-grid-components/views-type/views-type.component';
import { Polymorphism } from '../models/polymorphism.model';
import { View } from '../models/view.model';
import { ViewsService } from '../services/views.service';
import { ImportViewDialogData } from '../sub-dialogs/import-view/import-view-dialog.config';
import { calculateViewType } from './views.helpers';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss'],
})
export class ViewsComponent implements OnInit, OnDestroy {
  @Input() enableCode: boolean;
  @Input() enablePermissions: boolean;
  @Input() appIsGlobal: boolean;
  @Input() appIsInherited: boolean;

  views$ = new BehaviorSubject<View[]>(undefined);
  polymorphStatus$ = new BehaviorSubject(undefined);
  polymorphLogo = polymorphLogo;

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense',
        cellClass: (params) => `${(params.data as View).EditInfo.ReadOnly ? 'disabled' : ''} id-action no-padding no-outline`.split(' '),
        cellRenderer: IdFieldComponent, sortable: true, filter: 'agNumberColumnFilter',
        valueGetter: (params) => (params.data as View).Id,
        cellRendererParams: {
          tooltipGetter: (view: View) => `ID: ${view.Id}\nGUID: ${view.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Show', width: 70, headerClass: 'dense', cellClass: 'no-outline', cellRenderer: ViewsShowComponent,
        sortable: true, filter: BooleanFilterComponent, valueGetter: this.showValueGetter,
      },
      {
        field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight'.split(' '),
        sortable: true, sort: 'asc', filter: 'agTextColumnFilter', onCellClicked: (event) => this.editView(event.data as View),
        valueGetter: (params) => (params.data as View).Name,
      },
      {
        field: 'Type', width: 82, headerClass: 'dense', cellClass: 'no-padding no-outline'.split(' '),
        sortable: true, filter: 'agTextColumnFilter', cellRenderer: ViewsTypeComponent, valueGetter: this.typeValueGetter,
      },
      {
        field: 'Used', width: 70, headerClass: 'dense', cellClass: 'primary-action highlight'.split(' '),
        sortable: true, filter: 'agNumberColumnFilter', onCellClicked: (event) => this.openUsage(event.data as View),
        valueGetter: (params) => (params.data as View).Used,
      },
      {
        headerName: 'Url Key', field: 'UrlKey', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as View).ViewNameInUrl,
      },
      {
        field: 'Path', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as View).TemplatePath,
      },
      {
        field: 'Content', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as View).ContentType.Name,
      },
      {
        headerName: 'Default', field: 'ContentDemo', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.contentDemoValueGetter,
      },
      {
        field: 'Presentation', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as View).PresentationType.Name,
      },
      {
        headerName: 'Default', field: 'PresentationDemo', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.presentationDemoValueGetter,
      },
      {
        field: 'Header', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as View).ListContentType.Name,
      },
      {
        headerName: 'Default', field: 'HeaderDemo', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.headerDemoValueGetter,
      },
      {
        headerName: 'Header Presentation', field: 'HeaderPresentation', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as View).ListPresentationType.Name,
      },
      {
        headerName: 'Default', field: 'HeaderPresentationDemo', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.headerPresDemoValueGetter,
      },
      {
        width: 162, cellClass: 'secondary-action no-padding'.split(' '), cellRenderer: ViewsActionsComponent, pinned: 'right',
        cellRendererParams: {
          enableCodeGetter: () => this.enableCodeGetter(),
          enablePermissionsGetter: () => this.enablePermissionsGetter(),
          onOpenCode: (view) => this.openCode(view),
          onOpenPermissions: (view) => this.openPermissions(view),
          onOpenMetadata: (view) => this.openMetadata(view),
          onClone: (view) => this.cloneView(view),
          onExport: (view) => this.exportView(view),
          onDelete: (view) => this.deleteView(view),
        } as ViewActionsParams,
      },
    ],
  };

  private subscription = new Subscription();
  private polymorphism: Polymorphism;

  constructor(
    private viewsService: ViewsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.fetchTemplates();
    this.fetchPolymorphism();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.views$.complete();
    this.polymorphStatus$.complete();
    this.subscription.unsubscribe();
  }

  importView(files?: File[]) {
    const importViewData: ImportViewDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: importViewData });
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

  private showValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    return !view.IsHidden;
  }

  private typeValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    const type = calculateViewType(view);
    return type.value;
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private contentDemoValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    return `${view.ContentType.DemoId} ${view.ContentType.DemoTitle}`;
  }

  private presentationDemoValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    return `${view.PresentationType.DemoId} ${view.PresentationType.DemoTitle}`;
  }

  private headerDemoValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    return `${view.ListContentType.DemoId} ${view.ListContentType.DemoTitle}`;
  }

  private headerPresDemoValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    return `${view.ListPresentationType.DemoId} ${view.ListPresentationType.DemoTitle}`;
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

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchTemplates();
        this.fetchPolymorphism();
      })
    );
  }
}
