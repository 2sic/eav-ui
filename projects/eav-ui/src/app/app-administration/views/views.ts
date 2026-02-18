import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, computed, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { FeatureNames } from '../../features/feature-names';
import { openFeatureDialog } from '../../features/shared/base-feature';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { AgGridHelper } from '../../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { GridWithHelpComponent, HelpTextConst } from '../../shared/ag-grid/grid-with-help/grid-with-help';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { ItemIdHelper } from '../../shared/models/item-id-helper';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogInNewWindowService } from '../../shared/routing/dialog-in-new-window.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { SysDataService } from '../../shared/services/sys-data.service';
import { Polymorphism } from '../models/polymorphism.model';
import { View, ViewEntity } from '../models/view.model';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { Polymorphism_DS_ID, ViewsService } from '../services/views.service';
import { ConfirmDeleteDialogComponent } from '../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ConfirmDeleteDialogData } from '../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { ViewsActionsComponent } from './views-actions/views-actions';
import { ViewsShowComponent } from './views-show/views-show';
import { ViewsTypeComponent } from './views-type/views-type';
import { calculateViewType } from './views.helpers';

@Component({
  selector: 'app-views',
  templateUrl: './views.html',
  styleUrls: ['./views.scss'],
  imports: [
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    SxcGridModule,
    DragAndDropDirective,
    TippyDirective,
    GridWithHelpComponent
  ]
})
export class ViewsComponent implements OnInit {

  #isDebug = inject(GlobalConfigService).isDebug;
  #snackBar = inject(MatSnackBar);
  #matDialog = inject(MatDialog);
  #viewContainerRef = inject(ViewContainerRef);
  #changeDetectorRef = inject(ChangeDetectorRef);

  #dialogInNewWindowSvc = transient(DialogInNewWindowService);
  #viewsSvc = transient(ViewsService);
  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  enableCode: boolean;
  enablePermissions: boolean;
  appIsGlobal: boolean;
  appIsInherited: boolean;

  polymorphLogo = polymorphLogo;
  gridOptions = this.#buildGridOptions();

  #sysData = transient(SysDataService);

  constructor() { }

  refresh = signal(1); // must start with 1 so it can be chained in computed as ...refresh() && ...
  views = this.#viewsSvc.getAllLive(this.refresh).value;

  // #polymorphismLazy = this.#viewsSvc.getPolymorphismLive(this.refresh).value;

  #polymorphismData = this.#sysData.get<Polymorphism>({ source: Polymorphism_DS_ID });

  #polymorphismInfo = computed(() => this.#polymorphismData()?.[0]);

  polymorphStatus = computed(() => {
    const polymorphism = this.#polymorphismInfo();
    return polymorphism?.id == null // polymorphism could be undefined, and id could be null
      ? 'not configured'
      : polymorphism.resolver === null
        ? 'disabled'
        : 'using ' + polymorphism.resolver;
  });


  // UI Help Text for the UX Help Info Card
  #helpTextConst: HelpTextConst = {
    empty: {
      description: '<p><b>This is where you manage Views</b><br>They define how data is shown in the HTML output.</p>',
      hint: "<p>Click the (+) in the bottom right corner to create your first View.</p>"
    },
    content: {
      description: '<p><b>This is where you manage Views</b><br>They define how data is shown in the HTML output.</p>',
      hint: '<p>Click on the title to edit the View. <br>You can also edit the source, configure permissions, optimize performance and more.</p>'
    }
  };

  uxHelpText = computed(() => {
    const data = this.views();
    return data?.length === 0 ? this.#helpTextConst.empty : this.#helpTextConst.content;
  })

  ngOnInit() {

    this.#dialogRouter.doOnDialogClosed(() => this.#triggerRefresh());

    this.#dialogConfigSvc.getCurrent$().subscribe(data => {
      var ctx = data.Context;
      this.enableCode = ctx.Enable.CodeEditor
      this.enablePermissions = ctx.Enable.AppPermissions
      this.appIsGlobal = ctx.App.IsShared
      this.appIsInherited = ctx.App.IsInherited
    });
  }

  // This method is called multiple times, to reduce redundancy.
  // It calls the urlSubRoute method from the dialogRouter service
  // and sets a # infront of the url, so angular can differentiate
  // angular routes from ordinary urls.
  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  urlToImportView() { return this.#urlTo('import'); }

  importView(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navRelative(['import'], { state: dialogData });
  }

  #triggerRefresh() {
    this.refresh.update(v => ++v);
  }

  urlToNewView() {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          ItemIdHelper.newFromType(eavConstants.contentTypes.template, { ...(this.appIsGlobal && { Location: 'Global' }) })
        ],
      })}`
    );
  }

  urlToEditPolymorphisms() {
    const polymorphismSignal = this.#polymorphismInfo();
    if (!polymorphismSignal) return;

    const polymorphism = polymorphismSignal;
    if (!polymorphism) return;

    const itemsEntry = !polymorphism.id
      ? ItemIdHelper.newFromType(polymorphism.typeName)
      : ItemIdHelper.editId(polymorphism.id);

    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [itemsEntry],
      })}`
    );
  }

  //#region Grid Definition

  #buildGridOptions(): GridOptions {

    function showItemDetails(viewEntity: ViewEntity) {
      return (viewEntity.DemoId == 0) ? "" : `${viewEntity.DemoId} ${viewEntity.DemoTitle}`
    }

    // Helper function for actions in the table below
    const openLightSpeedFeatInfo = () =>
      openFeatureDialog(this.#matDialog, FeatureNames.LightSpeed, this.#viewContainerRef, this.#changeDetectorRef);

    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellClass: (p: { data: View }) => `id-action no-padding no-outline ${p.data.EditInfo.ReadOnly ? 'disabled' : ''}`.split(' '),
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<View>()
        },
        {
          ...ColumnDefinitions.IconShow,
          cellRenderer: ViewsShowComponent,
          valueGetter: (p: { data: View }) => !(p.data).IsHidden,
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          cellClass: 'primary-action highlight'.split(' '),
          sort: 'asc',
          cellRenderer: (p: { data: View, }) => AgGridHelper.cellLink(this.#urlToOpenEditView(p.data), p.data.Name),
        },
        {
          ...ColumnDefinitions.ItemsText,
          field: 'Type',
          width: 82,
          valueGetter: (p: { data: View }) => calculateViewType(p.data).value,
          cellRenderer: ViewsTypeComponent,
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Used',
          cellClass: 'primary-action highlight'.split(' '),
          cellRenderer: (p: { data: View, }) => AgGridHelper.cellLink(this.#urlToOpenUsage(p.data), p.data.Used.toString()),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Url Key',
          field: 'ViewNameInUrl',
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Path',
          field: 'TemplatePath',
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Content',
          valueGetter: (p: { data: View }) => (p.data).ContentType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'ContentDemo',
          valueGetter: (p: { data: View }) => showItemDetails((p.data).ContentType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Presentation',
          valueGetter: (p: { data: View }) => (p.data).PresentationType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'PresentationDemo',
          valueGetter: (p: { data: View }) => showItemDetails((p.data).PresentationType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Header',
          valueGetter: (p: { data: View }) => (p.data).ListContentType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'HeaderDemo',
          valueGetter: (p: { data: View }) => showItemDetails((p.data).ListContentType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Header Pres.',
          field: 'HeaderPresentation',
          valueGetter: (p: { data: View }) => (p.data).ListPresentationType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'HeaderPresentationDemo',
          valueGetter: (p: { data: View }) => showItemDetails((p.data).ListPresentationType),
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight5,
          cellRenderer: ViewsActionsComponent,
          cellRendererParams: {
            enableCodeGetter: () => this.enableCode,
            enablePermissionsGetter: () => this.enablePermissions,
            lightSpeedLink: (view: View) => this.#getLightSpeedLink(view),
            openLightspeedFeatureInfo: () => openLightSpeedFeatInfo(),
            urlTo: (verb, item) => {
              switch (verb) {
                case 'openMetadata': return '#' + this.#urlToOpenMetadata(item);
                case 'cloneView': return '#' + this.#urlToCloneView(item);
                case 'openPermissions': return '#' + this.#urlToOpenPermissions(item);
              }
            },
            do: (verb, view) => {
              switch (verb) {
                case 'openCode': this.#openCode(view); break;
                case 'exportView': this.#viewsSvc.export(view.Id); break;
                case 'deleteView': this.#deleteView(view); break;
              }
            },
          } satisfies ViewsActionsComponent['params'],
        },
      ],
    };
    return gridOptions;
  }

  //#endregion

  //#region Actions / Helpers for the Grid

  #urlToOpenEditView(view?: View) {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          view == null
            ? ItemIdHelper.newFromType(eavConstants.contentTypes.template, { ...(this.appIsGlobal && { Location: 'Global' }) })
            : ItemIdHelper.editId(view.Id),
        ],
      })}`
    );
  }

  #urlToOpenUsage(view: View) {
    return this.#urlTo(
      `usage/${view.Guid}`
    );
  }

  #openCode(view: View) {
    this.#dialogInNewWindowSvc.openCodeFile(view.TemplatePath, view.IsShared, view.Id);
  }

  #urlToOpenPermissions(view: View) {
    // Sets the # infront when calling this function
    return this.#dialogRouter.urlSubRoute(
      GoToPermissions.getUrlEntity(
        view.Guid
      )
    );
  }

  #urlToOpenMetadata(view: View) {
    // Sets the # infront when calling this function  
    return this.#dialogRouter.urlSubRoute(
      GoToMetadata.getUrlEntity(
        view.Guid,
        // Encode the title and replace '/' with '%2F'
        `Metadata for View: ${view.Name.replace(/\//g, '%2F')} (${view.Id})`)
    );
  }

  #urlToCloneView(view: View) {
    // Sets the # infront when calling this function
    return this.#dialogRouter.urlSubRoute(
      `edit/${convertFormToUrl({
        items: [ItemIdHelper.copy(eavConstants.contentTypes.template, view.Id)],
      })}`
    );
  }

  async #deleteView(view: View) {
    this.#matDialog.open(ConfirmDeleteDialogComponent, {
      autoFocus: false,
      data: {
        entityId: view.Id,
        entityTitle: view.Name,
        message: "Delete View?",
        hasDeleteSnackbar: true
      } as ConfirmDeleteDialogData,
      viewContainerRef: this.#viewContainerRef,
      width: '400px',
    }).afterClosed().subscribe(isConfirmed => {
      if (!isConfirmed) return;

      this.#viewsSvc.delete(view.Id).then(status => {
        if (status >= 200 && status < 300) {
          this.#snackBar.open('Deleted', null, { duration: 2000 });
          this.#triggerRefresh();
        }
      }).catch(error => {
        console.error('Error deleting view:', error);
        this.#snackBar.open('Error deleting view', null, { duration: 2000 });
      });
    });
  }

  #getLightSpeedLink(view?: View): string {
    const form: EditForm = {
      items: [
        {
          ClientData: {
            parameters: {
              forView: true,
              showDuration: false,
            },
          },
          ...(
            (view.lightSpeed != null)
              ? ItemIdHelper.editId(view.lightSpeed.Id)
              : ItemIdHelper.newMetadata(view.Guid, eavConstants.appMetadata.LightSpeed.ContentTypeName, eavConstants.metadata.entity)
          )
        },
      ],
    };

    return this.#dialogRouter.urlSubRoute(`edit/${convertFormToUrl(form)}`);
  }

  //#endregion
}
