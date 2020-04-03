import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AllCommunityModules, ColDef, CellClickedEvent } from '@ag-grid-community/all-modules';

import { View } from '../shared/models/view.model';
import { ViewsShowComponent } from '../shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from '../shared/ag-grid-components/views-actions/views-actions.component';
import { TemplatesService } from '../shared/services/templates.service';
import { ViewActionsParams } from '../shared/models/view-actions-params';
import { EditForm } from '../shared/models/edit-form.model';
import { eavConstants } from '../../shared/constants/eav-constants';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit, OnDestroy {
  views: View[];

  columnDefs: ColDef[] = [
    {
      headerName: 'Template Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editView.bind(this),
    },
    {
      headerName: 'Path', field: 'TemplatePath', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editView.bind(this),
    },
    {
      headerName: 'Content Type', field: 'ContentType.Name', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editView.bind(this),
    },
    {
      headerName: 'Demo Item', field: 'ContentType.DemoId', flex: 1, minWidth: 184, cellClass: 'clickable', sortable: true,
      filter: 'agNumberColumnFilter', onCellClicked: this.editView.bind(this),
    },
    {
      headerName: 'Hidden', field: 'IsHidden', flex: 1, minWidth: 168, cellRenderer: 'viewsShowComponent', sortable: true,
      filter: 'booleanFilterComponent',
    },
    {
      headerName: 'Url Key', field: 'ViewNameInUrl', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editView.bind(this),
    },
    {
      headerName: 'Actions', flex: 1, minWidth: 154, cellClass: 'no-padding', cellRenderer: 'viewsActionsComponent',
      cellRendererParams: {
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteView.bind(this),
      } as ViewActionsParams,
    },
  ];
  frameworkComponents = {
    booleanFilterComponent: BooleanFilterComponent,
    viewsShowComponent: ViewsShowComponent,
    viewsActionsComponent: ViewsActionsComponent,
  };
  modules = AllCommunityModules;

  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private templatesService: TemplatesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild.firstChild;
  }

  ngOnInit() {
    this.fetchTemplates();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  fetchTemplates() {
    this.templatesService.getAll().subscribe(views => {
      this.views = views;
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

  private openPermissions(view: View) {
    this.router.navigate(
      [`permissions/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/${view.Guid}`],
      { relativeTo: this.route.firstChild }
    );
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) { return; }
    this.templatesService.delete(view.Id).subscribe(res => {
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
        }
      })
    );
  }

}
