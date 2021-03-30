import { AllCommunityModules, CellClickedEvent, GridOptions } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { DialogService } from '../../shared/services/dialog.service';
import { QueriesActionsParams, QueryActions } from '../ag-grid-components/queries-actions/queries-actions';
import { QueriesActionsComponent } from '../ag-grid-components/queries-actions/queries-actions.component';
import { Query } from '../models/query.model';
import { PipelinesService } from '../services/pipelines.service';
import { ImportQueryDialogData } from '../sub-dialogs/import-query/import-query-dialog.config';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesComponent implements OnInit, OnDestroy {
  @Input() private enablePermissions: boolean;

  queries$ = new BehaviorSubject<Query[]>(null);
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
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        cellRendererParams: {
          tooltipGetter: (paramsData: Query) => `ID: ${paramsData.Id}\nGUID: ${paramsData.Guid}`,
        } as IdFieldParams,
      },
      {
        headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
        sort: 'asc', filter: 'agTextColumnFilter', onCellClicked: this.openVisualQueryDesigner.bind(this),
      },
      {
        headerName: 'Description', field: 'Description', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter',
      },
      {
        width: 120, cellClass: 'secondary-action no-padding', pinned: 'right',
        cellRenderer: 'queriesActionsComponent', cellRendererParams: {
          getEnablePermissions: this.enablePermissionsGetter.bind(this),
          do: this.doMenuAction.bind(this),
        } as QueriesActionsParams,
      },
    ],
  };

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pipelinesService: PipelinesService,
    private contentExportService: ContentExportService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.fetchQueries();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.queries$.complete();
    this.subscription.unsubscribe();
  }

  private fetchQueries() {
    this.pipelinesService.getAll(eavConstants.contentTypes.query).subscribe((queries: Query[]) => {
      this.queries$.next(queries);
    });
  }

  importQuery(files?: File[]) {
    const dialogData: ImportQueryDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: dialogData });
  }

  /**
   * Experiment by 2dm 2020-11-20 - trying to reduce the ceremony around menus
   * Once this works, we would then remove all the 3-line functions below, as they
   * would just be added here (if that's the only place they are used)
   */
  private doMenuAction(action: QueryActions, query: Query) {
    switch (action) {
      case QueryActions.Edit: return this.editQuery(query);
      case QueryActions.Rest:
        return this.router.navigate([GoToDevRest.goToQuery(query)], { relativeTo: this.route.firstChild });
      case QueryActions.Clone: return this.cloneQuery(query);
      case QueryActions.Permissions: return this.openPermissions(query);
      case QueryActions.Export: return this.exportQuery(query);
      case QueryActions.Delete: return this.deleteQuery(query);
    }
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

  private enablePermissionsGetter() {
    return this.enablePermissions;
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
    this.router.navigate([GoToPermissions.goEntity(query.Guid)], { relativeTo: this.route.firstChild });
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
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchQueries();
      })
    );
  }

}
