import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { DialogService } from '../../shared/services/dialog.service';
import { Query } from '../models/query.model';
import { PipelinesService } from '../services/pipelines.service';
import { QueriesActionsParams, QueryActions } from './queries-actions/queries-actions';
import { QueriesActionsComponent } from './queries-actions/queries-actions.component';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions } from '@angular/material/dialog';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { transient } from '../../core';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss'],
  standalone: true,
  imports: [
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    AsyncPipe,
    SxcGridModule,
    DragAndDropDirective,
  ],
})
export class QueriesComponent implements OnInit, OnDestroy {

  private pipelinesService = transient(PipelinesService);
  private contentExportService = transient(ContentExportService);
  private dialogService = transient(DialogService);
  #dialogRouter = transient(DialogRoutingService);
  
  enablePermissions!: boolean;
  queries$ = new BehaviorSubject<Query[]>(undefined);
  gridOptions = this.buildGridOptions();


  viewModel$ = combineLatest([this.queries$]).pipe(
    map(([queries]) => ({ queries }))
  );

  private dialogConfigSvc = transient(AppDialogConfigService);

  constructor(
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.fetchQueries();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchQueries());
    this.dialogConfigSvc.getCurrent$().subscribe(settings => {
      this.enablePermissions = settings.Context.Enable.AppPermissions;
    });
  }

  ngOnDestroy() {
    this.queries$.complete();
  }

  private fetchQueries() {
    this.pipelinesService.getAll(eavConstants.contentTypes.query).subscribe((queries: Query[]) => {
      this.queries$.next(queries);
    });
  }

  importQuery(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navParentFirstChild(['import'], { state: dialogData });
  }

  /**
   * Experiment by 2dm 2020-11-20 - trying to reduce the ceremony around menus
   * Once this works, we would then remove all the 3-line functions below, as they
   * would just be added here (if that's the only place they are used)
   */
  private doMenuAction(action: QueryActions, query: Query) {
    switch (action) {
      case QueryActions.Edit:
        return this.editQuery(query);
      case QueryActions.Metadata:
        return this.openMetadata(query);
      case QueryActions.Rest:
        return this.#dialogRouter.navParentFirstChild([GoToDevRest.getUrlQueryInAdmin(query.Guid)]);
      case QueryActions.Clone:
        return this.cloneQuery(query);
      case QueryActions.Permissions:
        return this.openPermissions(query);
      case QueryActions.Export:
        return this.exportQuery(query);
      case QueryActions.Delete:
        return this.deleteQuery(query);
    }
  }

  editQuery(query: Query) {
    const form: EditForm = {
      items: [
        query == null
          ? EditPrep.newFromType(eavConstants.contentTypes.query, { TestParameters: eavConstants.pipelineDesigner.testParameters })
          : EditPrep.editId(query.Id),
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private openVisualQueryDesigner(query: Query) {
    if (query._EditInfo.ReadOnly) { return; }
    this.dialogService.openQueryDesigner(query.Id);
  }

  private openMetadata(query: Query) {
    const url = GoToMetadata.getUrlEntity(
      query.Guid,
      `Metadata for Query: ${query.Name} (${query.Id})`,
    );
    this.#dialogRouter.navParentFirstChild([url]);
  }

  private cloneQuery(query: Query) {
    this.snackBar.open('Copying...');
    this.pipelinesService.clonePipeline(query.Id).subscribe(() => {
      this.snackBar.open('Copied', null, { duration: 2000 });
      this.fetchQueries();
    });
  }

  private openPermissions(query: Query) {
    this.#dialogRouter.navParentFirstChild([GoToPermissions.getUrlEntity(query.Guid)]);
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

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.Id,
          cellClass: (params) => {
            const query: Query = params.data;
            return `id-action no-padding no-outline ${query._EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<Query> = {
              tooltipGetter: (query) => `ID: ${query.Id}\nGUID: ${query.Guid}`,
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          sort: 'asc',
          cellClass: (params) => {
            const query: Query = params.data;
            return `${query._EditInfo.DisableEdit ? 'no-outline' : 'primary-action highlight'}`.split(' ');
          },
          onCellClicked: (params) => {
            const query: Query = params.data;
            this.openVisualQueryDesigner(query);
          },
        },
        {
          ...ColumnDefinitions.TextWideFlex3,
          field: 'Description',
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight4,
          cellRenderer: QueriesActionsComponent,
          cellRendererParams: (() => {
            const params: QueriesActionsParams = {
              getEnablePermissions: () => this.enablePermissionsGetter(),
              do: (action, query) => this.doMenuAction(action, query),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
