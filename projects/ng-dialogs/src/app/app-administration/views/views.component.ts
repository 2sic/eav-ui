import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';

import { View } from '../shared/models/view.model';
import { ViewsShowComponent } from '../shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from '../shared/ag-grid-components/views-actions/views-actions.component';
import { TemplatesService } from '../shared/services/templates.service';
import { ViewActionsParams } from '../shared/models/view-actions-params';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {
  views: View[];

  columnDefs: ColDef[] = [
    { headerName: 'Template Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Path', field: 'TemplatePath', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Content Type', field: 'ContentType.Name', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Demo Item', field: 'ContentType.DemoId', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Show', field: 'IsHidden', width: 100, cellRenderer: 'viewsShowComponent', onCellClicked: this.editView.bind(this) },
    { headerName: 'Url Key', field: 'ViewNameInUrl', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    {
      headerName: 'Actions', width: 100, cellRenderer: 'viewsActionsComponent',
      cellRendererParams: <ViewActionsParams>{
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteView.bind(this),
      }
    },
  ];
  frameworkComponents = {
    viewsShowComponent: ViewsShowComponent,
    viewsActionsComponent: ViewsActionsComponent,
  };
  modules = AllCommunityModules;

  constructor(
    private templatesService: TemplatesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fetchTemplates();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchTemplates() {
    this.templatesService.getAll().subscribe(views => {
      this.views = views;
    });
  }

  editView() {
    this.router.navigate(['edit'], { relativeTo: this.route.firstChild });
  }

  private openPermissions(view: View) {
    // spm figure out what type=4 and keyType='guid' mean
    this.router.navigate([`${view.Guid}/4/guid/permissions`], { relativeTo: this.route.firstChild });
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) { return; }
    this.templatesService.delete(view.Id).subscribe(res => {
      this.fetchTemplates();
    });
  }

}
