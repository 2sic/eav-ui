import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { Context } from '../../shared/context/context';
import { ContentType } from '../shared/models/content-type.model';
import { DataNameComponent } from '../shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from '../shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from '../shared/ag-grid-components/data-actions/data-actions.component';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {
  @Input() context: Context;
  contentTypes: ContentType[];
  frameworkComponents = {
    dataNameComponent: DataNameComponent,
    dataFieldsComponent: DataFieldsComponent,
    dataActionsComponent: DataActionsComponent,
  };
  columnDefs: ColDef[] = [
    {
      headerName: 'Name', field: 'Name', cellClass: 'clickable-with-button',
      cellRenderer: 'dataNameComponent', onCellClicked: this.handleNameCellClicked.bind(this)
    },
    { headerName: 'Description', field: 'Description', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this) },
    { headerName: 'Fields', width: 100, field: 'Items', cellRenderer: 'dataFieldsComponent' },
    { headerName: 'Actions', width: 200, cellRenderer: 'dataActionsComponent' },
  ];
  modules = AllCommunityModules;

  private scope = '2SexyContent'; // spm figure out how scope works

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${this.context.appId}&scope=${this.scope}`)
      .subscribe((contentTypes: ContentType[]) => {
        this.contentTypes = contentTypes;
      });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  handleNameCellClicked(params: CellClickedEvent) {
    const contentType = <ContentType>params.data;
    alert('Open content type data!');
    // open content type data modal
  }

}
