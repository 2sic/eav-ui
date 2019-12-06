import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';

import { Context } from '../../shared/context/context';
import { View } from '../shared/models/view.model';
import { ViewsShowComponent } from '../shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from '../shared/ag-grid-components/views-actions/views-actions.component';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {
  @Input() context: Context;
  views: View[];
  frameworkComponents = {
    viewsShowComponent: ViewsShowComponent,
    viewsActionsComponent: ViewsActionsComponent,
  };
  columnDefs: ColDef[] = [
    { headerName: 'Template Name', field: 'Name', cellClass: 'clickable' },
    { headerName: 'Path', field: 'TemplatePath', cellClass: 'clickable' },
    { headerName: 'Content Type', field: 'ContentType.Name', cellClass: 'clickable' },
    { headerName: 'Demo Item', field: 'ContentType.DemoId', cellClass: 'clickable' },
    { headerName: 'Show', field: 'IsHidden', width: 100, cellRenderer: 'viewsShowComponent' },
    { headerName: 'Url Key', field: 'ViewNameInUrl', cellClass: 'clickable' },
    { headerName: 'Actions', cellClass: 'clickable', width: 100, cellRenderer: 'viewsActionsComponent' },
  ];
  modules = AllCommunityModules;

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/app-sys/template/getall?appId=${this.context.appId}`)
      .subscribe((views: View[]) => {
        this.views = views;
      });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }


}
