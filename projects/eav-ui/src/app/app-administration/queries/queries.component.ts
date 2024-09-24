import { GridOptions } from '@ag-grid-community/core';
import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { transient } from '../../core';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { DialogService } from '../../shared/services/dialog.service';
import { signalObj } from '../../shared/signals/signal.utilities';
import { Query } from '../models/query.model';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { PipelinesService } from '../services/pipelines.service';
import { QueriesActionsParams, QueryActions } from './queries-actions/queries-actions';
import { QueriesActionsComponent } from './queries-actions/queries-actions.component';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
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
export class QueriesComponent implements OnInit {

  #pipelineSvc = transient(PipelinesService);
  #contentExportSvc = transient(ContentExportService);
  #dialogSvc = transient(DialogService);
  #dialogRouter = transient(DialogRoutingService);
  #dialogConfigSvc = transient(DialogConfigAppService);

  enablePermissions!: boolean;
  public gridOptions = this.buildGridOptions();

  public queries = signalObj<Query[]>('queries', []);

  constructor(
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.#fetchQueries();
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchQueries());
    this.#dialogConfigSvc.getCurrent$().subscribe(settings => {
      this.enablePermissions = settings.Context.Enable.AppPermissions;
    });
  }

  #fetchQueries() {
    this.#pipelineSvc.getAll(eavConstants.contentTypes.query)
      .subscribe((queries: Query[]) => this.queries.set(queries));
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

  private openVisualQueryDesigner(query: Query) {
    if (query._EditInfo.ReadOnly) return;
    this.#dialogSvc.openQueryDesigner(query.Id);
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
    this.#pipelineSvc.clonePipeline(query.Id).subscribe(() => {
      this.snackBar.open('Copied', null, { duration: 2000 });
      this.#fetchQueries();
    });
  }

  private openPermissions(query: Query) {
    this.#dialogRouter.navParentFirstChild([GoToPermissions.getUrlEntity(query.Guid)]);
  }

  private exportQuery(query: Query) {
    this.#contentExportSvc.exportEntity(query.Id, 'Query', true);
  }

  private deleteQuery(query: Query) {
    if (!confirm(`Delete Pipeline '${query.Name}' (${query.Id})?`)) return;
    this.snackBar.open('Deleting...');
    this.#pipelineSvc.delete(query.Id).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.#fetchQueries();
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellClass: (p) => {
            return `id-action no-padding no-outline ${p.data._EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
          },
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<Query>(),
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          sort: 'asc',
          cellClass: (p) => {
            const query: Query = p.data;
            return `${query._EditInfo.DisableEdit ? 'no-outline' : 'primary-action highlight'}`.split(' ');
          },
          onCellClicked: (p) => {
            const query: Query = p.data;
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
              getEnablePermissions: () => this.enablePermissions,
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
