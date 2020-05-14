import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AllCommunityModules, GridOptions, CellClickedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';
import { MatSnackBar } from '@angular/material/snack-bar';

import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { View } from '../models/view.model';
import { calculateViewType } from './views.helpers';
import { ViewsTypeComponent } from '../ag-grid-components/views-type/views-type.component';
import { ViewsShowComponent } from '../ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from '../ag-grid-components/views-actions/views-actions.component';
import { TemplatesService } from '../services/templates.service';
import { ViewActionsParams } from '../ag-grid-components/views-actions/views-actions.models';
import { EditForm } from '../../shared/models/edit-form.model';
import { eavConstants } from '../../shared/constants/eav.constants';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { DialogService } from '../../shared/services/dialog.service';
import { Polymorphism } from '../models/polymorphism.model';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit, OnDestroy {
  views: View[];
  polymorphStatus: string;
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
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
      },
      {
        headerName: 'Show', field: 'IsHidden', width: 70, headerClass: 'dense', cellClass: 'no-outline', cellRenderer: 'viewsShowComponent',
        sortable: true, filter: 'booleanFilterComponent', valueGetter: this.showValueGetter,
      },
      {
        headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.editView.bind(this),
      },
      {
        headerName: 'Type', field: 'Type', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', cellRenderer: 'viewsTypeComponent', valueGetter: this.typeValueGetter,
      },
      {
        headerName: 'Used', field: 'Used', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'agNumberColumnFilter',
      },
      {
        width: 120, cellClass: 'secondary-action no-padding', cellRenderer: 'viewsActionsComponent',
        cellRendererParams: {
          onOpenCode: this.openCode.bind(this),
          onOpenPermissions: this.openPermissions.bind(this),
          onDelete: this.deleteView.bind(this),
        } as ViewActionsParams,
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
    ],
  };

  private subscription = new Subscription();
  private hasChild: boolean;
  private polymorphism: Polymorphism;

  constructor(
    private templatesService: TemplatesService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild.firstChild;
  }

  ngOnInit() {
    this.fetchTemplates();
    this.fetchPolymorphism();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  private fetchTemplates() {
    this.templatesService.getAll().subscribe(views => {
      this.views = views;
    });
  }

  private fetchPolymorphism() {
    this.templatesService.getPolymorphism().subscribe(polymorphism => {
      this.polymorphism = polymorphism;
      this.polymorphStatus = (polymorphism.Id === null)
        ? 'not configured'
        : (polymorphism.Resolver === null ? 'disabled' : 'using ' + polymorphism.Resolver);
    });
  }

  editView(params: CellClickedEvent) {
    let form: EditForm;
    if (params === null) {
      form = {
        items: [{ ContentTypeName: eavConstants.contentTypes.template }],
      };
    } else {
      const view: View = params.data;
      form = {
        items: [{ EntityId: view.Id.toString() }],
      };
    }
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  editPolymorphisms() {
    if (!this.polymorphism) { return; }

    const form: EditForm = {
      items: [
        this.polymorphism.Id
          ? { EntityId: this.polymorphism.Id.toString() }
          : { ContentTypeName: this.polymorphism.TypeName }
      ]
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private idValueGetter(params: ValueGetterParams) {
    const view: View = params.data;
    return `ID: ${view.Id}\nGUID: ${view.Guid}`;
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

  private openCode(view: View) {
    this.dialogService.openCodeFile(view.TemplatePath);
  }

  private openPermissions(view: View) {
    this.router.navigate(
      [`permissions/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/${view.Guid}`],
      { relativeTo: this.route.firstChild }
    );
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.templatesService.delete(view.Id).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchTemplates();
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild.firstChild;
        if (!this.hasChild && hadChild) {
          this.fetchTemplates();
          this.fetchPolymorphism();
        }
      })
    );
  }

}
