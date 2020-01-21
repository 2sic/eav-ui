import { Component, OnInit } from '@angular/core';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';

import { Query } from '../shared/models/query.model';
import { QueriesDescriptionComponent } from '../shared/ag-grid-components/queries-description/queries-description.component';
import { PipelinesService } from '../shared/services/pipelines.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit {
  queries: Query[];

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'Id', cellClass: 'clickable', width: 50, onCellClicked: this.openVisualQueryDesigner.bind(this) },
    { headerName: 'Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.openVisualQueryDesigner.bind(this) },
    {
      headerName: 'Description', field: 'Description', cellClass: 'clickable-with-button',
      onCellClicked: this.openVisualQueryDesigner.bind(this), cellRenderer: 'queriesDescriptionComponent',
    },
  ];
  frameworkComponents = {
    queriesDescriptionComponent: QueriesDescriptionComponent
  };
  modules = AllCommunityModules;

  private contentType = 'DataPipeline'; // spm Figure out what is data pipeline

  constructor(
    private pipelinesService: PipelinesService,
  ) { }

  ngOnInit() {
    this.fetchPipelines();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchPipelines() {
    this.pipelinesService.getAll(this.contentType).subscribe((queries: Query[]) => {
      this.queries = queries;
    });
  }

  private openVisualQueryDesigner() {
    alert('Open visual query designer');
  }
}
