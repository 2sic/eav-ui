import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { AllCommunityModules, CellClickedEvent, GridOptions, ValueGetterParams } from '@ag-grid-community/all-modules';
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

  views$ = new BehaviorSubject<View[]>(null);
  polymorphStatus$ = new BehaviorSubject('');
  polymorphLogo = polymorphLogo;

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      booleanFilterComponent: BooleanFilterComponent,
      viewsTypeComponent: ViewsTypeComponent,
      viewsShowComponent: ViewsShowComponent,
      viewsActionsComponent: ViewsActionsComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        cellRendererParams: {
          tooltipGetter: (paramsData: View) => `ID: ${paramsData.Id}\nGUID: ${paramsData.Guid}`,
        } as IdFieldParams,
      },
      {
        headerName: 'Show', field: 'IsHidden', width: 70, headerClass: 'dense', cellClass: 'no-outline', cellRenderer: 'viewsShowComponent',
        sortable: true, filter: 'booleanFilterComponent', valueGetter: this.showValueGetter,
      },
      {
        headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, sort: 'asc', filter: 'agTextColumnFilter', onCellClicked: this.editView.bind(this),
      },
      {
        headerName: 'Type', field: 'Type', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', cellRenderer: 'viewsTypeComponent', valueGetter: this.typeValueGetter,
      },
      {
        headerName: 'Used', field: 'Used', width: 70, headerClass: 'dense', cellClass: 'primary-action highlight',
        sortable: true, filter: 'agNumberColumnFilter', onCellClicked: (event) => { this.openUsage(event); }
      },
      {
        headerName: 'Url Key', field: 'ViewNameInUrl', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Path', field: 'TemplatePath', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Content', field: 'ContentType.Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Default', field: 'ContentType.DemoId', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.contentDemoValueGetter,
      },
      {
        headerName: 'Presentation', field: 'PresentationType.Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Default', field: 'PresentationType.DemoId', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.presentationDemoValueGetter,
      },
      {
        headerName: 'Header', field: 'ListContentType.Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Default', field: 'ListContentType.DemoId', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.headerDemoValueGetter,
      },
      {
        headerName: 'Header Presentation', field: 'ListPresentationType.Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Default', field: 'ListPresentationType.DemoId', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.headerPresDemoValueGetter,
      },
      {
        width: 120, cellClass: 'secondary-action no-padding', cellRenderer: 'viewsActionsComponent', pinned: 'right',
        cellRendererParams: {
          enableCodeGetter: this.enableCodeGetter.bind(this),
          enablePermissionsGetter: this.enablePermissionsGetter.bind(this),
          onOpenCode: this.openCode.bind(this),
          onOpenPermissions: this.openPermissions.bind(this),
          onOpenMetadata: this.openMetadata.bind(this),
          onClone: this.cloneView.bind(this),
          onExport: this.exportView.bind(this),
          onDelete: this.deleteView.bind(this),
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

  editView(params: CellClickedEvent) {
    const view: View = params?.data;
    const form: EditForm = {
      items: [
        view == null
          ? { ContentTypeName: eavConstants.contentTypes.template }
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

  private openUsage(event: CellClickedEvent) {
    const view: View = event.data;
    this.router.navigate([`usage/${view.Guid}`], { relativeTo: this.route.firstChild });
  }

  private openCode(view: View) {
    this.dialogService.openCodeFile(view.TemplatePath, view.IsShared);
  }

  private openPermissions(view: View) {
    this.router.navigate([GoToPermissions.goEntity(view.Guid)], { relativeTo: this.route.firstChild });
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
