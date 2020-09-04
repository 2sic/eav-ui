import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AllCommunityModules, GridOptions, ValueGetterParams, CellClickedEvent } from '@ag-grid-community/all-modules';

import { Query } from '../models/query.model';
import { QueriesActionsComponent } from '../ag-grid-components/queries-actions/queries-actions.component';
import { PipelinesService } from '../services/pipelines.service';
import { ContentExportService } from '../services/content-export.service';
import { QueriesActionsParams } from '../ag-grid-components/queries-actions/queries-actions.models';
import { EditForm } from '../../shared/models/edit-form.model';
import { eavConstants } from '../../shared/constants/eav.constants';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { DialogService } from '../../shared/services/dialog.service';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit, OnDestroy {
  queries: Query[];

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      queriesActionsComponent: QueriesActionsComponent,
    },
    columnDefs: [
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
        } as QueriesActionsParams,
      },
      {
        headerName: 'Description', field: 'Description', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter',
      },
    ],
  };

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
      items: [
        query == null
          ? {
            ContentTypeName: eavConstants.contentTypes.query,
            Prefill: { TestParameters: eavConstants.pipelineDesigner.testParameters }
          }
          : { EntityId: query.Id }
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private idValueGetter(params: ValueGetterParams) {
    const query: Query = params.data;
    return `ID: ${query.Id}\nGUID: ${query.Guid}`;
  }

  private openVisualQueryDesigner(params: CellClickedEvent) {
    const query: Query = params.data;
    this.dialogService.openQueryDesigner(query.Id);
  }

  private cloneQuery(query: Query) {
    this.snackBar.open('Copying...');
    this.pipelinesService.clonePipeline(query.Id).subscribe(() => {
      this.snackBar.open('Copied', null, { duration: 2000 });
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
    this.snackBar.open('Deleting...');
    this.pipelinesService.delete(query.Id).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
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
