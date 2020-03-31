import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ColDef, AllCommunityModules } from '@ag-grid-community/all-modules';

import { Query } from '../shared/models/query.model';
import { QueriesActionsComponent } from '../shared/ag-grid-components/queries-actions/queries-actions.component';
import { PipelinesService } from '../shared/services/pipelines.service';
import { ContentExportService } from '../shared/services/content-export.service';
import { PipelinesActionsParams } from '../shared/models/pipeline-actions-params';
import { EditForm } from '../shared/models/edit-form.model';
import { eavConstants } from '../../shared/constants/eav-constants';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit, OnDestroy {
  queries: Query[];

  columnDefs: ColDef[] = [
    {
      headerName: 'ID', field: 'Id', width: 136, cellClass: 'clickable', sortable: true,
      filter: 'agNumberColumnFilter', onCellClicked: this.openVisualQueryDesigner.bind(this),
    },
    {
      headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.openVisualQueryDesigner.bind(this),
    },
    {
      headerName: 'Description', field: 'Description', flex: 3, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.openVisualQueryDesigner.bind(this),
    },
    {
      headerName: 'Actions', flex: 1, minWidth: 346, cellClass: 'no-padding',
      cellRenderer: 'queriesActionsComponent', cellRendererParams: {
        onEditQuery: this.editQuery.bind(this),
        onCloneQuery: this.cloneQuery.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
        onExportQuery: this.exportQuery.bind(this),
        onDelete: this.deleteQuery.bind(this),
      } as PipelinesActionsParams,
    }
  ];
  frameworkComponents = {
    queriesActionsComponent: QueriesActionsComponent,
  };
  modules = AllCommunityModules;

  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pipelinesService: PipelinesService,
    private contentExportService: ContentExportService,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild.firstChild;
  }

  ngOnInit() {
    this.fetchQueries();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  fetchQueries() {
    this.pipelinesService.getAll(eavConstants.contentTypes.query).subscribe((queries: Query[]) => {
      this.queries = queries;
    });
  }

  importQuery() {
    this.router.navigate(['import'], { relativeTo: this.route.firstChild });
  }

  editQuery(query: Query) {
    const form: EditForm = {
      items: (query === null)
        ? [{ ContentTypeName: eavConstants.contentTypes.query, Prefill: { TestParameters: eavConstants.pipelineDesigner.testParameters } }]
        : [{ EntityId: query.Id.toString(), Title: query.Name }],
    };
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
    this.router.navigate(
      [`permissions/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/${query.Guid}`],
      { relativeTo: this.route.firstChild }
    );
  }

  private exportQuery(query: Query) {
    this.contentExportService.exportEntity(query.Id, 'Query', true);
  }

  private deleteQuery(query: Query) {
    if (!confirm(`Delete Pipeline '${query.Name}' (${query.Id})?`)) { return; }
    this.pipelinesService.delete(query.Id).subscribe(res => {
      this.fetchQueries();
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild.firstChild;
        if (!this.hasChild && hadChild) {
          this.fetchQueries();
        }
      })
    );
  }

}
