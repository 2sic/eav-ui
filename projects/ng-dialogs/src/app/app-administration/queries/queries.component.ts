import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ColDef, AllCommunityModules, ValueGetterParams } from '@ag-grid-community/all-modules';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Query } from '../models/query.model';
import { QueriesActionsComponent } from '../ag-grid-components/queries-actions/queries-actions.component';
import { PipelinesService } from '../services/pipelines.service';
import { ContentExportService } from '../services/content-export.service';
import { PipelinesActionsParams } from '../models/pipeline-actions-params';
import { EditForm } from '../models/edit-form.model';
import { eavConstants } from '../../shared/constants/eav.constants';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit, OnDestroy {
  queries: Query[];

  columnDefs: ColDef[] = [
    {
      headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
      cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
    },
    {
      headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.openVisualQueryDesigner.bind(this),
    },
    {
      width: 200, cellClass: 'secondary-action no-padding',
      cellRenderer: 'queriesActionsComponent', cellRendererParams: {
        onEditQuery: this.editQuery.bind(this),
        onCloneQuery: this.cloneQuery.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
        onExportQuery: this.exportQuery.bind(this),
        onDelete: this.deleteQuery.bind(this),
      } as PipelinesActionsParams,
    },
    {
      headerName: 'Description', field: 'Description', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
      filter: 'agTextColumnFilter',
    },
  ];
  frameworkComponents = {
    idFieldComponent: IdFieldComponent,
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
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
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

  private fetchQueries() {
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
        : [{ EntityId: query.Id.toString() }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private idValueGetter(params: ValueGetterParams) {
    const query: Query = params.data;
    return `ID: ${query.Id}\nGUID: ${query.Guid}`;
  }

  private openVisualQueryDesigner(params: ValueGetterParams) {
    const query: Query = params.data;
    const form: EditForm = {
      items: [{ EntityId: query.Id.toString() }],
    };
    this.dialogService.openQueryDesigner(form, query.Id);
  }

  private cloneQuery(query: Query) {
    this.snackBar.open(`Copying...`);
    this.pipelinesService.clonePipeline(query.Id).subscribe(() => {
      this.snackBar.open(`Copied`, null, { duration: 2000 });
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
    this.snackBar.open(`Deleting...`);
    this.pipelinesService.delete(query.Id).subscribe(res => {
      this.snackBar.open(`Deleted`, null, { duration: 2000 });
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
