import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { Query } from '../shared/models/query.model';
import { QueriesDescriptionComponent } from '../shared/ag-grid-components/queries-description/queries-description.component';
import { PipelinesService } from '../shared/services/pipelines.service';
import { PipelinesActionsParams } from '../shared/models/pipeline-actions-params';
import { EditForm } from '../shared/models/edit-form.model';
import { EavConfigurationService } from '../shared/services/eav-configuration.service';
import { DialogService } from '../../shared/components/dialog-service/dialog.service';
import { ITEMS_EDIT_DIALOG } from '../../shared/constants/dialog-names';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit, OnDestroy {
  queries: Query[];

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'Id', cellClass: 'clickable', width: 50, onCellClicked: this.openVisualQueryDesigner.bind(this) },
    { headerName: 'Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.openVisualQueryDesigner.bind(this) },
    {
      headerName: 'Description', field: 'Description', cellClass: 'clickable-with-button',
      onCellClicked: this.openVisualQueryDesigner.bind(this), cellRenderer: 'queriesDescriptionComponent',
      cellRendererParams: <PipelinesActionsParams>{
        onEditQuery: this.editQuery.bind(this),
        onCloneQuery: this.cloneQuery.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteQuery.bind(this),
      }
    },
  ];
  frameworkComponents = {
    queriesDescriptionComponent: QueriesDescriptionComponent
  };
  modules = AllCommunityModules;

  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pipelinesService: PipelinesService,
    private dialogService: DialogService,
    private eavConfigurationService: EavConfigurationService,
  ) { }

  ngOnInit() {
    this.fetchQueries();
    this.subscription.add(
      this.dialogService.subToClosed([ITEMS_EDIT_DIALOG]).subscribe(closedDialog => {
        console.log('Dialog closed event captured:', closedDialog);
        this.fetchQueries();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchQueries() {
    this.pipelinesService.getAll(this.eavConfigurationService.contentType.query).subscribe((queries: Query[]) => {
      this.queries = queries;
    });
  }

  editQuery(query: Query) {
    let form: EditForm;
    if (query === null) {
      // spm fix prefill and &user[canDesign]=true&user[canDevelop]=true
      // var items = [{
      //   ContentTypeName: 'DataPipeline',
      //   Prefill: { TestParameters: eavConfig.pipelineDesigner.testParameters }
      // }];
      form = {
        addItems: [{ ContentTypeName: this.eavConfigurationService.contentType.query }],
        editItems: null,
        persistedData: {},
      };
    } else {
      form = {
        addItems: null,
        editItems: [{ EntityId: query.Id.toString(), Title: query.Name }],
        persistedData: {},
      };
    }
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private openVisualQueryDesigner() {
    alert('Open visual query designer');
  }

  private cloneQuery(query: Query) {
    this.pipelinesService.clonePipeline(query.Id).subscribe(() => {
      this.fetchQueries();
    });
  }

  private openPermissions(query: Query) {
    alert('Open permissions');
  }

  private deleteQuery(query: Query) {
    if (!confirm(`Delete Pipeline '${query.Name}' (${query.Id})?`)) { return; }
    this.pipelinesService.delete(query.Id).subscribe(res => {
      this.fetchQueries();
    });
  }
}
