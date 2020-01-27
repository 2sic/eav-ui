import { Component, OnInit } from '@angular/core';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';

import { View } from '../shared/models/view.model';
import { ViewsShowComponent } from '../shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from '../shared/ag-grid-components/views-actions/views-actions.component';
import { TemplatesService } from '../shared/services/templates.service';
import { ViewsActionsParams } from '../shared/models/views-actions-params';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {
  views: View[];

  columnDefs: ColDef[] = [
    { headerName: 'Template Name', field: 'Name', cellClass: 'clickable' },
    { headerName: 'Path', field: 'TemplatePath', cellClass: 'clickable' },
    { headerName: 'Content Type', field: 'ContentType.Name', cellClass: 'clickable' },
    { headerName: 'Demo Item', field: 'ContentType.DemoId', cellClass: 'clickable' },
    { headerName: 'Show', field: 'IsHidden', width: 100, cellRenderer: 'viewsShowComponent' },
    { headerName: 'Url Key', field: 'ViewNameInUrl', cellClass: 'clickable' },
    {
      headerName: 'Actions', width: 100, cellRenderer: 'viewsActionsComponent',
      cellRendererParams: <ViewsActionsParams>{
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

  private deleteView(view: View) {
    if (!confirm(`delete '${view.Name}' (${view.Id})?`)) { return; }
    this.templatesService.delete(view.Id).subscribe(res => {
      this.fetchTemplates();
    });
  }

}
