import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, computed, OnInit, signal, ViewContainerRef, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { FeatureNames } from '../../features/feature-names';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
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
import { DialogInNewWindowService } from '../../shared/routing/dialog-in-new-window.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Polymorphism } from '../models/polymorphism.model';
import { View, ViewEntity } from '../models/view.model';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { ViewsService } from '../services/views.service';
import { ViewsActionsComponent } from './views-actions/views-actions.component';
import { ViewsShowComponent } from './views-show/views-show.component';
import { ViewsTypeComponent } from './views-type/views-type.component';
import { calculateViewType } from './views.helpers';

@Component({
    selector: 'app-views',
    templateUrl: './views.component.html',
    styleUrls: ['./views.component.scss'],
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
export class ViewsComponent implements OnInit {
  #dialogInNewWindowSvc = transient(DialogInNewWindowService);
  enableCode: boolean;
  enablePermissions: boolean;
  appIsGlobal: boolean;
  appIsInherited: boolean;

  polymorphLogo = polymorphLogo;
  gridOptions = this.buildGridOptions();

  #viewsSvc = transient(ViewsService);
  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private snackBar: MatSnackBar,
    // For Lightspeed buttons - new 17.10 - may need to merge better w/code changes 2dg
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) { }

  #refresh = signal(0);

  views = computed(() => {
    const refresh = this.#refresh();
    return this.#viewsSvc.getAll();
  });

  #polymorphism = computed(() => {
    const refresh = this.#refresh();
    return this.#viewsSvc.getPolymorphism();
  })

  polymorphStatus = computed(() => {
    const internalSignal = this.#polymorphism() as WritableSignal<Polymorphism>;
    if (internalSignal() === undefined) return 'not configured';
    // this.#polymorphism = internalSignal();
    return (internalSignal()?.Id === null)
      ? 'not configured'
      : (internalSignal().Resolver === null ? 'disabled' : 'using ' + internalSignal().Resolver);
  });

  ngOnInit() {

    this.#dialogRouter.doOnDialogClosed(() => {
      this.#fetchTemplates();
    });

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

  #fetchTemplates() {
    this.#refresh.update(value => value + 1);
  }

  #urlToOpenEditView(view?: View) {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          view == null
            ? EditPrep.newFromType(eavConstants.contentTypes.template, { ...(this.appIsGlobal && { Location: 'Global' }) })
            : EditPrep.editId(view.Id),
        ],
      })}`
    );
  }

  urlToNewView() {
    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [
          EditPrep.newFromType(eavConstants.contentTypes.template, { ...(this.appIsGlobal && { Location: 'Global' }) })
        ],
      })}`
    );
  }

  // 2pp | not in use?
  // private openEdit(form: EditForm) {
  //   this.openChildDialog(`edit/${convertFormToUrl(form)}`);
  // }

  // private openChildDialog(subPath: string) {
  //   this.#dialogRouter.navParentFirstChild([subPath]);
  // }

  urlToEditPolymorphisms() {
    const polymorphismSignal = this.#polymorphism();
    if (!polymorphismSignal) return;

    const polymorphism = polymorphismSignal();
    if (!polymorphism) return;

    const itemsEntry = !polymorphism.Id
      ? EditPrep.newFromType(polymorphism.TypeName)
      : EditPrep.editId(polymorphism.Id);

    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [itemsEntry],
      })}`
    );
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  #urlToOpenUsage(view: View) {
    return this.#urlTo(
      `usage/${view.Guid}`
    );
  }

  private openCode(view: View) {
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
        items: [EditPrep.copy(eavConstants.contentTypes.template, view.Id)],
      })}`
    );
  }

  private exportView(view: View) {
    this.#viewsSvc.export(view.Id);
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) return;
    this.snackBar.open('Deleting...');
    this.#viewsSvc.delete(view.Id).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.#fetchTemplates();
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
              ? EditPrep.editId(view.lightSpeed.Id)
              : EditPrep.newMetadata(view.Guid, eavConstants.appMetadata.LightSpeed.ContentTypeName, eavConstants.metadata.entity)
          )
        },
      ],
    };

    return this.#dialogRouter.urlSubRoute(`edit/${convertFormToUrl(form)}`);
  }


  private buildGridOptions(): GridOptions {

    function showItemDetails(viewEntity: ViewEntity) {
      return (viewEntity.DemoId == 0) ? "" : `${viewEntity.DemoId} ${viewEntity.DemoTitle}`
    }

    // Helper function for actions in the table below
    const openLightSpeedFeatInfo = () =>
      openFeatureDialog(this.matDialog, FeatureNames.LightSpeed, this.viewContainerRef, this.changeDetectorRef);

    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellClass: (p) => {
            const view: View = p.data;
            return `id-action no-padding no-outline ${view.EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
          },
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<View>()
        },
        {
          ...ColumnDefinitions.IconShow,
          valueGetter: (p) => !(p.data as View).IsHidden,
          cellRenderer: ViewsShowComponent,
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
          valueGetter: (p) => calculateViewType(p.data as View).value,
          cellRenderer: ViewsTypeComponent,
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Used',
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
          valueGetter: (p) => (p.data as View).ContentType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'ContentDemo',
          valueGetter: (p) => showItemDetails((p.data as View).ContentType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Presentation',
          valueGetter: (p) => (p.data as View).PresentationType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'PresentationDemo',
          valueGetter: (p) => showItemDetails((p.data as View).PresentationType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Header',
          valueGetter: (p) => (p.data as View).ListContentType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'HeaderDemo',
          valueGetter: (p) => showItemDetails((p.data as View).ListContentType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Header Pres.',
          field: 'HeaderPresentation',
          valueGetter: (p) => (p.data as View).ListPresentationType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'HeaderPresentationDemo',
          valueGetter: (p) => showItemDetails((p.data as View).ListPresentationType),
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight5,
          cellRenderer: ViewsActionsComponent,
          cellRendererParams: {
            enableCodeGetter: () => this.enableCodeGetter(),
            enablePermissionsGetter: () => this.enablePermissionsGetter(),
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
                case 'openCode': this.openCode(view); break;
                case 'exportView': this.exportView(view); break;
                case 'deleteView': this.deleteView(view); break;
              }
            },
          // } satisfies ViewActionsParams,
          } satisfies ViewsActionsComponent["params"],
        },
      ],
    };
    return gridOptions;
  }
}
