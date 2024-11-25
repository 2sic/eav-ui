import { GridOptions } from '@ag-grid-community/core';
import { Component, computed, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { ContentExportService } from '../../content-export/services/content-export.service';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { AgGridHelper } from '../../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { DialogService } from '../../shared/services/dialog.service';
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
    // AsyncPipe,
    SxcGridModule,
    DragAndDropDirective,
    TippyDirective,
  ],
})
export class QueriesComponent implements OnInit {

  #pipelineSvc = transient(PipelinesService);
  #contentExportSvc = transient(ContentExportService);
  #dialogSvc = transient(DialogService);
  #dialogRouter = transient(DialogRoutingService);
  #dialogConfigSvc = transient(DialogConfigAppService);

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  enablePermissions!: boolean;
  public gridOptions = this.buildGridOptions();

  #refresh = signal(0);

  queries = computed(() => {
    const refresh = this.#refresh();
    return this.#pipelineSvc.getAllSig(eavConstants.contentTypes.query, undefined)
  });

  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchQueries());
    this.#dialogConfigSvc.getCurrent$().subscribe(settings => {
      this.enablePermissions = settings.Context.Enable.AppPermissions;
    });
  }

  #fetchQueries() {
    this.#refresh.update(value => value + 1);
  }

  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  urlToImportQuery() {
    return this.#urlTo(`import`);
  }

  #urlToEdit(query: Query) {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          query == null
            ? EditPrep.newFromType(eavConstants.contentTypes.query, { TestParameters: eavConstants.pipelineDesigner.testParameters })
            : EditPrep.editId(query.Id),
        ],
      })}`
    );
  }

  importQuery(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navParentFirstChild(['import'], { state: dialogData });
  }

  urlToNewQuery() {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          EditPrep.newFromType(eavConstants.contentTypes.query, { TestParameters: eavConstants.pipelineDesigner.testParameters })
        ],
      })}`
    );
  }

  #urlToOpenVisualQueryDesigner(query: Query): string {
    // TODO: @2pp | "../../" works, but isn't cleanest way.
    // Prob. need to change routing for this?
    // TODO: @2pp | ensure this opens in new tab
    return this.#urlTo(
      `../../query/${convertFormToUrl({
        items: [EditPrep.editId(query.Id)],
      } satisfies EditForm)}`
    );
  }

  #urlToOpenMetadata(query: Query): string {
    return this.#urlTo(
      GoToMetadata.getUrlEntity(
        query.Guid,
        `Metadata for Query: ${query.Name} (${query.Id})`,
      )
    );
  }

  #urlToPermissoins(query: Query): string {
    return this.#urlTo(GoToPermissions.getUrlEntity(query.Guid));
  }

  #urlToRestApi(query: Query): string {
    return this.#urlTo(GoToDevRest.getUrlQueryInAdmin(query.Guid));
  }

  private cloneQuery(query: Query) {
    this.snackBar.open('Copying...');
    this.#pipelineSvc.clonePipeline(query.Id).subscribe(() => {
      this.snackBar.open('Copied', null, { duration: 2000 });
      this.#fetchQueries();
    });
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
          cellRenderer: (p: { data: Query }) => AgGridHelper.cellLink(this.#urlToOpenVisualQueryDesigner(p.data), p.data.Name),
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
              do: (action, query) => {
                switch (action) {
                  case QueryActions.Clone: return this.cloneQuery(query);
                  case QueryActions.Export: return this.exportQuery(query);
                  case QueryActions.Delete: return this.deleteQuery(query);
                }
              },
              urlTo: (action, query) => {
                switch (action) {
                  case QueryActions.Edit: return this.#urlToEdit(query);
                  case QueryActions.Metadata: return this.#urlToOpenMetadata(query);
                  case QueryActions.Rest: return this.#urlToRestApi(query);
                  case QueryActions.Permissions: return this.#urlToPermissoins(query);
                }
              },
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
