import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, take } from 'rxjs';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { EntityEditService } from '../shared/services/entity-edit.service';
import { EavFor } from '../edit/shared/models/eav';
import { MetadataService } from '../permissions';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep, ItemAddIdentifier } from '../shared/models/edit-form.model';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmDeleteDialogData } from './confirm-delete-dialog/confirm-delete-dialog.models';
import { MetadataActionsComponent } from './metadata-actions/metadata-actions.component';
import { MetadataActionsParams } from './metadata-actions/metadata-actions.models';
import { MetadataContentTypeComponent } from './metadata-content-type/metadata-content-type.component';
import { MetadataSaveDialogComponent } from './metadata-save-dialog/metadata-save-dialog.component';
import { MetadataDto, MetadataItem, MetadataRecommendation, MetadataViewModel } from './models/metadata.model';
import { openFeatureDialog } from '../features/shared/base-feature.component';
import { MatBadgeModule } from '@angular/material/badge';
import { NgClass, AsyncPipe } from '@angular/common';
import { EcoFabSpeedDialComponent, EcoFabSpeedDialTriggerComponent, EcoFabSpeedDialActionsComponent } from '@ecodev/fab-speed-dial';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { SafeHtmlPipe } from '../shared/pipes/safe-html.pipe';
import { convert, transient } from '../core';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { classLog } from '../shared/logging';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
  standalone: true,
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
    AsyncPipe,
    SafeHtmlPipe,
  ],
})
export class MetadataComponent implements OnInit, OnDestroy {
  
  log = classLog({MetadataComponent});

  #entitiesSvc = transient(EntityEditService);
  #metadataSvc = transient(MetadataService);
  #contentItemSvc = transient(ContentItemsService);
  #dialogRoutes = transient(DialogRoutingService);

  constructor(
    private dialogRef: MatDialogRef<MetadataComponent>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  gridOptions = this.#buildGridOptions();

  #metadataSet$ = new BehaviorSubject<MetadataDto>({ Items: [], Recommendations: [] } as MetadataDto);
  #itemFor$ = new BehaviorSubject<EavFor | undefined>(undefined);
  #fabOpen$ = new BehaviorSubject(false);
  #params = convert(this.#dialogRoutes.getParams(['targetType', 'keyType', 'key', 'title', 'contentTypeStaticName']), p => ({
    targetType: parseInt(p.targetType, 10),
    keyType: p.keyType as MetadataKeyType,
    key: p.key,
    contentTypeStaticName: p.contentTypeStaticName,
  }));
  protected title = decodeURIComponent(this.#dialogRoutes.getParam('title') ?? '');
  viewModel$: Observable<MetadataViewModel>;

  ngOnInit() {
    this.#fetchFor();
    this.#fetchMetadata();
    this.#dialogRoutes.doOnDialogClosed(() => this.#fetchMetadata());

    const logFilteredRecs = this.log.rxTap('filteredRecs$');

    // TODO: @2dg - this should be easy to get rid of #remove-observables
    this.#metadataSet$.subscribe((set) => {
      this.log.a('test 2dm', { set });
    });

    const filteredRecs$ = this.#metadataSet$.pipe(
      logFilteredRecs.pipe(),
      map((set) => set.Recommendations.filter(r => set.Items.filter(i => i._Type.Id === r.Id).length < r.Count)),
      logFilteredRecs.map(),
    );

    const logViewModel = this.log.rxTap('viewModel$');
    this.viewModel$ = combineLatest([this.#metadataSet$, filteredRecs$, this.#itemFor$, this.#fabOpen$]).pipe(
      logViewModel.pipe(),
      map(([metadata, recommendations, itemFor, fabOpen]) => {
        const viewModel: MetadataViewModel = {
          metadata: metadata.Items,
          recommendations,
          itemFor,
          fabOpen,
        };
        return viewModel;
      }),
      logViewModel.map(),
    );
  }

  ngOnDestroy() {
    this.log.a('destroying');
    this.#metadataSet$.complete();
    this.#itemFor$.complete();
    this.#fabOpen$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openChange(open: boolean) {
    this.#fabOpen$.next(open);
  }

  createMetadata(recommendation?: MetadataRecommendation) {
    if (recommendation) {
      // If the feature is not enabled, open the info dialog instead of metadata
      if (!recommendation.Enabled) {
        openFeatureDialog(this.dialog, recommendation.MissingFeature, this.viewContainerRef, this.changeDetectorRef);
        return;
      }
      // Feature is enabled, check if it's an empty metadata
      if (recommendation.CreateEmpty) {
        this.snackBar.open(`Creating ${recommendation.Name}...`);
        this.#entitiesSvc.create(recommendation.Id, { For: this.calculateItemFor('dummy').For }).subscribe({
          error: () => {
            this.snackBar.open(`Creating ${recommendation.Name} failed. Please check console for more info`, undefined, { duration: 3000 });
            this.#fetchMetadata();
          },
          next: () => {
            this.snackBar.open(`Created ${recommendation.Name}`, undefined, { duration: 3000 });
            this.#fetchMetadata();
          },
        });
      } else {
        // Default case - open new-metadata dialog
        this.createMetadataForm(recommendation.Id);
      }
      return;
    }
    const metadataDialogRef = this.dialog.open(MetadataSaveDialogComponent, {
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
    const x = EditPrep.constructMetadataInfo(this.#params.targetType, this.#params.keyType, this.#params.key);
    return EditPrep.newMetadataFromInfo(contentType, x);
  }

  #fetchFor() {
    if (!this.#params.contentTypeStaticName) return;

    this.#contentItemSvc.getAll(this.#params.contentTypeStaticName).subscribe(items => {
      const item = items.find(i => i.Guid === this.#params.key);
      if (item?.For)
        this.#itemFor$.next(item.For);
    });
  }

  #fetchMetadata() {
    const logGetMetadata = this.log.rxTap('getMetadata');
    this.#metadataSvc.getMetadata(this.#params.targetType, this.#params.keyType, this.#params.key)
      .pipe(
        logGetMetadata.pipe(),
        take(1),
        map(metadata => {
          metadata.Recommendations.forEach(r => {
            if (r.Icon?.startsWith('base64:')) {
              r.Icon = r.Icon.replace('base64:', '');
              r.Icon = window.atob(r.Icon);
              // used for coloring black icons to white
              r.Icon = r.Icon.replace('fill="#000000"', 'fill="#ffffff"');
            }
          });
          return metadata;
        }),
        logGetMetadata.map(),
      )
      // 2024-05-30 2dm - this standard shorthand seems to fail
      // for reasons unknown to me. I've replaced it with the longhand
      // The problem occurs when the metadataSet$ is updated after the initial load.
      // .subscribe(this.metadataSet$);
      .subscribe(data => this.#metadataSet$.next(data));
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
        message: this.#metadataSet$.value.Recommendations.find(r => r.Id === metadata._Type.Id)?.DeleteWarning,
      };
      const confirmationDialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
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
        this.#fetchMetadata();
      },
      error: () => {
        this.snackBar.open('Delete failed. Please check console for more information', null, { duration: 3000 });
      }
    });
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
          onCellClicked: (p: { data: MetadataItem}) => this.#editMetadata(p.data),
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Content Type',
          field: 'ContentType',
          valueGetter: (p: { data: MetadataItem}) => `${p.data._Type.Name}${p.data._Type.Title !== p.data._Type.Name ? ` (${p.data._Type.Title})` : ''}`,
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
