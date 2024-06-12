import polymorphLogo from '!url-loader!./polymorph-logo.png';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseWithChildDialogComponent } from '../../shared/components/base-component/base-with-child-dialog.component';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { DialogService } from '../../shared/services/dialog.service';
import { Polymorphism } from '../models/polymorphism.model';
import { View, ViewEntity } from '../models/view.model';
import { ViewsService } from '../services/views.service';
import { ViewsActionsComponent } from './views-actions/views-actions.component';
import { ViewActionsParams } from './views-actions/views-actions.models';
import { ViewsShowComponent } from './views-show/views-show.component';
import { ViewsTypeComponent } from './views-type/views-type.component';
import { calculateViewType } from './views.helpers';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { App } from '../../apps-management/models/app.model';
import { FeatureComponentBase } from '../../features/shared/base-feature.component';
import { FeatureNames } from '../../features/feature-names';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions } from '@angular/material/dialog';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';

@Component({
    selector: 'app-views',
    templateUrl: './views.component.html',
    styleUrls: ['./views.component.scss'],
    standalone: true,
    imports: [
        AgGridModule,
        SharedComponentsModule,
        MatDialogActions,
        MatButtonModule,
        MatIconModule,
        RouterOutlet,
        AsyncPipe,
        SxcGridModule,
    ],
})
export class ViewsComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {
  enableCode: boolean;
  enablePermissions: boolean;
  appIsGlobal: boolean;
  appIsInherited: boolean;

  views$ = new BehaviorSubject<View[]>(undefined);
  polymorphStatus$ = new BehaviorSubject(undefined);
  polymorphLogo = polymorphLogo;
  gridOptions = this.buildGridOptions();

  private polymorphism: Polymorphism;

  viewModel$: Observable<ViewsViewModel>;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private viewsService: ViewsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private dialogConfigSvc: AppDialogConfigService,

    // For Lightspeed buttons - new 17.10 - may need to merge better w/code changes 2dg
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(router, route);
   }

  ngOnInit() {
    this.fetchTemplates();
    this.fetchPolymorphism();
    this.subscription.add(this.childDialogClosed$().subscribe(() => {
      this.fetchTemplates();
      this.fetchPolymorphism();
    }));
    this.viewModel$ = combineLatest([this.views$, this.polymorphStatus$]).pipe(
      map(([views, polymorphStatus]) => ({ views, polymorphStatus }))
    );

    this.dialogConfigSvc.getCurrent$().subscribe(data => {
      var ctx = data.Context;
      this.enableCode = ctx.Enable.CodeEditor
      this.enablePermissions = ctx.Enable.AppPermissions
      this.appIsGlobal = ctx.App.IsShared
      this.appIsInherited = ctx.App.IsInherited
    });
  }

  ngOnDestroy() {
    this.views$.complete();
    this.polymorphStatus$.complete();
    super.ngOnDestroy();
  }

  importView(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.parent.firstChild, state: dialogData });
  }

  private fetchTemplates() {
    this.viewsService.getAll().subscribe(views => {
      this.views$.next(views);
    });
  }

  private fetchPolymorphism() {
    this.viewsService.getPolymorphism().subscribe(polymorphism => {
      this.polymorphism = polymorphism;
      const polymorphStatus = (polymorphism.Id === null)
        ? 'not configured'
        : (polymorphism.Resolver === null ? 'disabled' : 'using ' + polymorphism.Resolver);
      this.polymorphStatus$.next(polymorphStatus);
    });
  }

  editView(view?: View) {
    const form: EditForm = {
      items: [
        view == null
          ? {
            ContentTypeName: eavConstants.contentTypes.template,
            Prefill: {
              ...(this.appIsGlobal && { Location: 'Global' }),
            },
          }
          : { EntityId: view.Id }
      ],
    };
    this.openEdit(form);
  }

  private openEdit(form: EditForm) {
    this.openChildDialog(`edit/${convertFormToUrl(form)}`);
  }

  private openChildDialog(subPath: string) {
    this.router.navigate([subPath], { relativeTo: this.route.parent.firstChild });
  }

  editPolymorphisms() {
    if (!this.polymorphism) { return; }

    const form: EditForm = {
      items: [
        !this.polymorphism.Id
          ? { ContentTypeName: this.polymorphism.TypeName }
          : { EntityId: this.polymorphism.Id }
      ],
    };
    this.openEdit(form);
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private enablePermissionsGetter() {
    return this.enablePermissions;
  }

  private openUsage(view: View) {
    this.openChildDialog(`usage/${view.Guid}`);
  }

  private openCode(view: View) {
    this.dialogService.openCodeFile(view.TemplatePath, view.IsShared, view.Id);
  }

  private openPermissions(view: View) {
    this.openChildDialog(GoToPermissions.getUrlEntity(view.Guid));
  }

  private openMetadata(view: View) {
    const url = GoToMetadata.getUrlEntity(
      view.Guid,
      `Metadata for View: ${view.Name} (${view.Id})`,
    );
    this.openChildDialog(url);
  }

  private cloneView(view: View) {
    const form: EditForm = {
      items: [{ ContentTypeName: eavConstants.contentTypes.template, DuplicateEntity: view.Id }],
    };
    this.openEdit(form);
  }

  private exportView(view: View) {
    this.viewsService.export(view.Id);
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.viewsService.delete(view.Id).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchTemplates();
    });
  }

  private openLightSpeed(view: View): void {
    const shared = {
      ClientData: {
        parameters: {
          forView: true,
          showDuration: false,
        },
      },
    }

    const form: EditForm = {
      items: [
        (view.lightSpeed != null)
          ? {
              ...shared,
              EntityId: view.lightSpeed.Id,
            }
          : {
              ...shared,
              ContentTypeName: eavConstants.appMetadata.LightSpeed.ContentTypeName,
              For: {
                Target: eavConstants.metadata.entity.target,
                TargetType: eavConstants.metadata.entity.targetType,
                Guid: view.Guid,
              },
            },
      ],
    };
    this.openEdit(form);
  }


  private buildGridOptions(): GridOptions {
    // TODO: we should use this simpler pattern for column definitions everywhere
    // ColumnDefinitions.TextWide
    // ColumnDefinitions.TextNarrow

    function showItemDetails(viewEntity: ViewEntity) {
      return (viewEntity.DemoId == 0) ? "" : `${viewEntity.DemoId} ${viewEntity.DemoTitle}`
    }

    // Helper function for actions in the table below
    const openLightSpeedFeatInfo = () => 
      FeatureComponentBase.openDialog(this.dialog, FeatureNames.LightSpeed, this.viewContainerRef, this.changeDetectorRef);
    
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.Id,
          cellClass: (params) => {
            const view: View = params.data;
            return `id-action no-padding no-outline ${view.EditInfo.ReadOnly ? 'disabled' : ''}`.split(' ');
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<View> = {
              tooltipGetter: (view) => `ID: ${view.Id}\nGUID: ${view.Guid}`,
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.IconShow,
          valueGetter: (params) => !(params.data as View).IsHidden,
          cellRenderer: ViewsShowComponent,
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          cellClass: 'primary-action highlight'.split(' '),
          sort: 'asc',
          onCellClicked: (params) => {
            const view: View = params.data;
            this.editView(view);
          },
        },
        {
          field: 'Type',
          width: 82,
          headerClass: 'dense',
          cellClass: 'no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => calculateViewType(params.data as View).value,
          cellRenderer: ViewsTypeComponent,
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Used',
          onCellClicked: (params) => this.openUsage(params.data as View),
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
          valueGetter: (params) => (params.data as View).ContentType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'ContentDemo',
          valueGetter: (params) => showItemDetails((params.data as View).ContentType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Presentation',
          valueGetter: (params) => (params.data as View).PresentationType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'PresentationDemo',
          valueGetter: (params) => showItemDetails((params.data as View).PresentationType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Header',
          valueGetter: (params) => (params.data as View).ListContentType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'HeaderDemo',
          valueGetter: (params) => showItemDetails((params.data as View).ListContentType),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Header Pres.',
          field: 'HeaderPresentation',
          valueGetter: (params) => (params.data as View).ListPresentationType.Name,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Default',
          field: 'HeaderPresentationDemo',
          valueGetter: (params) => showItemDetails((params.data as View).ListPresentationType),
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight5,
          cellRenderer: ViewsActionsComponent,
          cellRendererParams: {
            enableCodeGetter: () => this.enableCodeGetter(),
            enablePermissionsGetter: () => this.enablePermissionsGetter(),
            onOpenCode: (view) => this.openCode(view),
            onOpenPermissions: (view) => this.openPermissions(view),
            onOpenMetadata: (view) => this.openMetadata(view),
            onClone: (view) => this.cloneView(view),
            onExport: (view) => this.exportView(view),
            onDelete: (view) => this.deleteView(view),
            onOpenLightspeed: (view: unknown) => this.openLightSpeed(view as View),
            openLightspeedFeatureInfo: () => openLightSpeedFeatInfo(),
          } satisfies ViewActionsParams,
        },
      ],
    };
    return gridOptions;
  }
}

interface ViewsViewModel {
  views: View[];
  polymorphStatus: any;
}
