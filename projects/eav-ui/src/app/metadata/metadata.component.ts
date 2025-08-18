import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, computed, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { EcoFabSpeedDialActionsComponent, EcoFabSpeedDialComponent, EcoFabSpeedDialTriggerComponent } from '@ecodev/fab-speed-dial';
import { convert, Of, transient } from '../../../../core';
import { ConfirmDeleteDialogComponent } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmDeleteDialogData } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { EavForInAdminUi } from '../edit/shared/models/eav';
import { openFeatureDialog } from '../features/shared/base-feature.component';
import { MetadataService } from '../permissions';
import { AgGridHelper } from '../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { GridWithHelpComponent, HelpTextConst } from '../shared/ag-grid/grid-with-help/grid-with-help.component';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { MetadataKeyTypes } from '../shared/constants/eav.constants';
import { MatBadgeIconDirective } from '../shared/directives/mat-badge-icon.directive';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { classLog } from '../shared/logging';
import { EditForm, EditPrep, ItemAddIdentifier } from '../shared/models/edit-form.model';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { SafeHtmlPipe } from '../shared/pipes/safe-html.pipe';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { EntityEditService } from '../shared/services/entity-edit.service';
import { MetadataActionsComponent } from './metadata-actions/metadata-actions.component';
import { MetadataActionsParams } from './metadata-actions/metadata-actions.models';
import { MetadataContentTypeComponent } from './metadata-content-type/metadata-content-type.component';
import { MetadataSaveDialogComponent } from './metadata-save-dialog/metadata-save-dialog.component';
import { MetadataItem, MetadataRecommendation } from './models/metadata.model';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    SxcGridModule,
    MatDialogActions,
    EcoFabSpeedDialComponent,
    NgClass,
    EcoFabSpeedDialTriggerComponent,
    EcoFabSpeedDialActionsComponent,
    MatBadgeModule,
    MatBadgeIconDirective,
    SafeHtmlPipe,
    GridWithHelpComponent,
  ]
})
export class MetadataComponent implements OnInit {

  log = classLog({ MetadataComponent });

  #entitiesSvc = transient(EntityEditService);
  #metadataSvc = transient(MetadataService);
  #contentItemSvc = transient(ContentItemsService);
  #dialogRoutes = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<MetadataComponent>,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }


  gridOptions = this.#buildGridOptions();

  fabOpen = signal(false);

  #params = convert(this.#dialogRoutes.getParams(['targetType', 'keyType', 'key', 'title', 'contentTypeStaticName']), p => ({
    targetType: parseInt(p.targetType, 10),
    keyType: p.keyType as Of<typeof MetadataKeyTypes>,
    key: p.key,
    contentTypeStaticName: p.contentTypeStaticName,
  }));


  // Signal to get itemFor - must be _outside_ the computed property, otherwise it regenerates infinitely
  #itemsFromHttp = this.#contentItemSvc.getAllOnce(this.#params.contentTypeStaticName).value;

  itemFor = computed<EavForInAdminUi | undefined>(() => {
    const item = this.#itemsFromHttp()?.find(i => i.Guid === this.#params.key);
    return (item?.For)
      ? item.For
      : undefined;
  });

  refresh = signal<number>(0);
  #metadataResource = this.#metadataSvc.getMetadataLive(this.refresh, this.#params.targetType, this.#params.keyType, this.#params.key).value


  // UI Help Text for the UX Help Info Card
  #helpTextConst: HelpTextConst = {
    empty: {
      description: '<p><b>This is where you manage Metadata</b></p>',
      hint: "<p>Click the (+) in the bottom right corner to create your first Metadata for the current item.</p>"
    },
    content: {
      description: '<p><b>Each row shows Metadata for the current item</b> <br>Metadata describes/configures something, similar to labels you could attach to clothes.</p>',
      hint: '<p>Click on the row to edit the Metadata. <br>You can also create new Metadata.</p>'
    }
  };

  uxHelpText = computed(() => {
    const data = this.metadataSet()?.Items;
    return data?.length === 0 ? this.#helpTextConst.empty : this.#helpTextConst.content;
  })


  metadataSet = computed(() => {
    const metadata = this.#metadataResource();
    if (!metadata) return undefined;

    const clone = structuredClone(metadata);

    clone.Recommendations.forEach(r => {
      if (r.Icon?.startsWith('base64:')) {
        let icon = r.Icon.replace('base64:', '');
        icon = window.atob(icon);
        icon = icon.replace('fill="#000000"', 'fill="#ffffff"');
        r.Icon = icon;
      }
    });
    return clone;
  });


  recommendations = computed(() => {
    const metadata = this.metadataSet();
    return metadata?.Recommendations.filter(r =>
      metadata?.Items.filter(i => i._Type.Id === r.Id).length < r.Count
    );
  });

  protected title = (() => {
    try {
      return decodeURIComponent(this.#dialogRoutes.getParam('title') ?? '');
    } catch (e) {
      console.error('Couldn\'t properly decode title');
      return this.#dialogRoutes.getParam('title') ?? '';
    }
  })();

  ngOnInit() {
    this.#dialogRoutes.doOnDialogClosed(() => this.refresh.update(pre => pre + 1));
  }

  closeDialog() {
    this.dialog.close();
  }

  openChange(open: boolean) {
    this.fabOpen.set(open);
  }

  createMetadata(recommendation?: MetadataRecommendation) {
    if (recommendation) {
      // If the feature is not enabled, open the info dialog instead of metadata
      if (!recommendation.Enabled) {
        openFeatureDialog(this.matDialog, recommendation.MissingFeature, this.viewContainerRef, this.changeDetectorRef);
        return;
      }
      // Feature is enabled, check if it's an empty metadata
      if (recommendation.CreateEmpty) {
        this.snackBar.open(`Creating ${recommendation.Name}...`);
        this.#entitiesSvc.create(recommendation.Id, { For: this.calculateItemFor('dummy').For }).subscribe({
          error: () => {
            this.snackBar.open(`Creating ${recommendation.Name} failed. Please check console for more info`, undefined, { duration: 3000 });
            this.refresh.update(pre => pre + 1)
          },
          next: () => {
            this.snackBar.open(`Created ${recommendation.Name}`, undefined, { duration: 3000 });
            this.refresh.update(pre => pre + 1)
          },
        });
      } else {
        // Default case - open new-metadata dialog
        this.createMetadataForm(recommendation.Id);
      }
      return;
    }
    const metadataDialogRef = this.matDialog.open(MetadataSaveDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    metadataDialogRef.afterClosed().subscribe((contentType?: string) => {
      if (contentType == null) return;
      this.createMetadataForm(contentType);
    });
  }

  private createMetadataForm(contentType: string) {
    const form: EditForm = {
      items: [this.calculateItemFor(contentType)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
    this.changeDetectorRef.markForCheck();
  }

  private calculateItemFor(contentType: string): ItemAddIdentifier {
    const temp = EditPrep.constructMetadataInfo(this.#params.targetType, this.#params.keyType, this.#params.key);
    return EditPrep.newMetadataFromInfo(contentType, temp);
  }


  #editMetadata(metadata: MetadataItem) {
    const form: EditForm = {
      items: [EditPrep.editId(metadata.Id)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  #deleteMetadata(metadata: MetadataItem, confirmed = false) {
    if (!confirmed) {
      const data: ConfirmDeleteDialogData = {
        entityId: metadata.Id,
        entityTitle: metadata.Title,
        message: this.metadataSet().Recommendations.find(r => r.Id === metadata._Type.Id)?.DeleteWarning,
      };
      const confirmationDialogRef = this.matDialog.open(ConfirmDeleteDialogComponent, {
        autoFocus: false,
        data,
        viewContainerRef: this.viewContainerRef,
        width: '400px',
      });
      confirmationDialogRef.afterClosed().subscribe((isConfirmed: boolean) => {
        if (isConfirmed)
          this.#deleteMetadata(metadata, true);
      });
      return;
    }

    this.snackBar.open('Deleting...');
    this.#entitiesSvc.delete(metadata._Type.Id, metadata.Id, false).subscribe({
      next: () => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.refresh.update(pre => pre + 1);
      },
      error: () => {
        this.snackBar.open('Delete failed. Please check console for more information', null, { duration: 3000 });
      }
    });
  }

  #metadataEditUrl(metadata: MetadataItem): string {
    const form: EditForm = {
      items: [EditPrep.editId(metadata.Id)],
    };
    const formUrl = convertFormToUrl(form);
    // Use your dialogRoutes service to generate the correct sub-route
    return '#' + this.#dialogRoutes.urlSubRoute(`edit/${formUrl}`);
  }

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<MetadataItem>()
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Title',
          cellRenderer: (params: ICellRendererParams & { data: MetadataItem }) =>
            AgGridHelper.cellLink(
              this.#metadataEditUrl(params.data),
              params.value
            ),
          onCellClicked: (p: { data: MetadataItem }) => this.#editMetadata(p.data),
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Content Type',
          field: 'ContentType',
          valueGetter: (p: { data: MetadataItem }) => `${p.data._Type.Name}${p.data._Type.Title !== p.data._Type.Name ? ` (${p.data._Type.Title})` : ''}`,
          cellRenderer: MetadataContentTypeComponent,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight1,
          cellRenderer: MetadataActionsComponent,
          cellRendererParams: (() => ({
            onDelete: (metadata) => this.#deleteMetadata(metadata),
          } satisfies MetadataActionsParams))(),
        },
      ],
    };
    return gridOptions;
  }
}
