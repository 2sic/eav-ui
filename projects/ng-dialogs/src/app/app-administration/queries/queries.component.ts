import { Component, OnInit, Input } from '@angular/core';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';

import { Context } from '../../shared/context/context';
import { Query } from '../shared/models/query.model';
import { QueriesDescriptionComponent } from '../shared/ag-grid-components/queries-description/queries-description.component';
import { PipelinesService } from '../shared/services/pipelines.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit {
  @Input() context: Context;
  queries: Query[];

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'Id', cellClass: 'clickable', width: 50, onCellClicked: this.handleNameClicked.bind(this) },
    { headerName: 'Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.handleNameClicked.bind(this) },
    {
      headerName: 'Description', field: 'Description', cellClass: 'clickable-with-button',
      onCellClicked: this.handleNameClicked.bind(this), cellRenderer: 'queriesDescriptionComponent',
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
    this.pipelinesService.getAll(this.context.appId, this.contentType).subscribe((queries: Query[]) => {
      this.queries = queries;
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  private handleNameClicked() {
    alert('Open visual query designer');
  }
}
