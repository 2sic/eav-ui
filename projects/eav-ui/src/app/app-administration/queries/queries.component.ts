import { GridOptions } from '@ag-grid-community/core';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { classLog } from '../../shared/logging';
import { EditPrep } from '../../shared/models/edit-form.model';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { RouteLinkHelper } from '../../shared/routing/route-link-helper';
import { Context } from '../../shared/services/context';
import { Query } from '../models/query.model';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { PipelinesService } from '../services/pipelines.service';
import { QueriesActionsParams, QueryActions } from './queries-actions/queries-actions';
import { QueriesActionsComponent } from './queries-actions/queries-actions.component';

const logSpecs = {
  all: false,
  urlToOpenVisualQueryDesigner: true,
  titleCellRenderer: true,
  cloneQuery: false,
  deleteQuery: false,
  exportQuery: false,
};

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  imports: [
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    SxcGridModule,
    DragAndDropDirective,
    TippyDirective,
  ]
})
export class QueriesComponent implements OnInit {

  log = classLog({ QueriesComponent }, logSpecs);

  #pipelineSvc = transient(PipelinesService);
  #contentExportSvc = transient(ContentExportService);
  #dialogRouter = transient(DialogRoutingService);
  #dialogConfigSvc = transient(DialogConfigAppService);

  #context = inject(Context);
  #snackBar = inject(MatSnackBar);

  constructor() { }

  enablePermissions!: boolean;
  public gridOptions = this.buildGridOptions();

  #refresh = signal(0);
  // queries = computed(() => {
  //   const refresh = this.#refresh();
  //   return this.#pipelineSvc.getAllSig(eavConstants.contentTypes.query, undefined)
  // });

  queries = this.#pipelineSvc.getAllLive(eavConstants.contentTypes.query, undefined).value;

  ngOnInit() {
    // watch for return from dialog to reload queries
    this.#dialogRouter.doOnDialogClosed(() => this.#triggerRefresh());

    // get setting for enablePermissions on load
    this.#dialogConfigSvc.getCurrent$().subscribe(settings => {
      this.enablePermissions = settings.Context.Enable.AppPermissions;
    });
  }

  //#region methods for template actions

  urlToImportQuery() {
    return this.#urlTo(`import`);
  }

  importQuery(files?: File[]) {
    this.#dialogRouter.navRelative(['import'], { state: { files } satisfies FileUploadDialogData });
  }

  urlToNewQuery() {
    return this.#urlToEditOrNew(null);
  }

  //#endregion

  #triggerRefresh() {
    this.#refresh.update(v => ++v);
  }

  #urlTo(url: string) {
    return `#${this.#dialogRouter.urlSubRoute(url)}`;
  }

  #urlToEditOrNew(query?: Query) {
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

  #urlToOpenVisualQueryDesigner(query: Query): string {
    return '#/' + new RouteLinkHelper().routeTo(this.#context, `query/${query.Id}`);
  }

  #urlToOpenMetadata(query: Query): string {
    return this.#urlTo(
      GoToMetadata.getUrlEntity(query.Guid, `Metadata for Query: ${query.Name} (${query.Id})`)
    );
  }

  #urlToPermissions(query: Query): string {
    return this.#urlTo(GoToPermissions.getUrlEntity(query.Guid));
  }

  #urlToRestApi(query: Query): string {
    return this.#urlTo(GoToDevRest.getUrlQueryInAdmin(query.Guid));
  }

  private cloneQuery(query: Query) {
    const l = this.log.fnIf('cloneQuery', { query });
    this.#snackBar.open('Copying...');
    this.#pipelineSvc.clonePipeline(query.Id).subscribe(() => {
      this.#snackBar.open('Copied', null, { duration: 2000 });
      this.#triggerRefresh();
    });
    l.end();
  }

  private exportQuery(query: Query) {
    const l = this.log.fnIf('exportQuery', { query });
    this.#contentExportSvc.exportEntity(query.Id, 'Query', true);
    l.end();
  }

  private deleteQuery(query: Query) {
    const l = this.log.fnIf('deleteQuery', { query });
    if (!confirm(`Delete Pipeline '${query.Name}' (${query.Id})?`))
      return;
    this.#snackBar.open('Deleting...');
    this.#pipelineSvc.delete(query.Id).subscribe(res => {
      this.#snackBar.open('Deleted', null, { duration: 2000 });
      this.#triggerRefresh();
    });
    l.end();
  }

  /** Render the title cell w/link - as own method to allow better debugging */
  #titleCellRenderer(query: Query) {
    const l = this.log.fnIf('titleCellRenderer', { query });
    const url = this.#urlToOpenVisualQueryDesigner(query);
    l.values({ url });
    return `<a href="${url}" target="_blank" class="default-link" style="display: block; width: 100%; height: 100%;">
              ${query.Name}
            </a>`;
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellClass: (p: { data: Query }) => `id-action no-padding no-outline ${p.data._EditInfo.ReadOnly ? 'disabled' : ''}`.split(' '),
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<Query>(),
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          sort: 'asc',
          cellClass: (p: { data: Query }) => `${p.data._EditInfo.DisableEdit ? 'no-outline' : 'primary-action highlight'}`.split(' '),
          cellRenderer: (p: { data: Query }) => this.#titleCellRenderer(p.data),
        },
        {
          ...ColumnDefinitions.TextWideFlex3,
          field: 'Description',
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight4,
          cellRenderer: QueriesActionsComponent,
          cellRendererParams: ({
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
                case QueryActions.Edit: return this.#urlToEditOrNew(query);
                case QueryActions.Metadata: return this.#urlToOpenMetadata(query);
                case QueryActions.Rest: return this.#urlToRestApi(query);
                case QueryActions.Permissions: return this.#urlToPermissions(query);
              }
            },
          } satisfies QueriesActionsParams),
        },
      ],
    };
    return gridOptions;
  }
}
