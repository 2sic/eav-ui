import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, startWith, take, tap } from 'rxjs';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { EavFor } from '../edit/shared/models/eav';
import { MetadataService } from '../permissions';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmDeleteDialogData } from './confirm-delete-dialog/confirm-delete-dialog.models';
import { MetadataActionsComponent } from './metadata-actions/metadata-actions.component';
import { MetadataActionsParams } from './metadata-actions/metadata-actions.models';
import { MetadataContentTypeComponent } from './metadata-content-type/metadata-content-type.component';
import { MetadataSaveDialogComponent } from './metadata-save-dialog/metadata-save-dialog.component';
import { MetadataDto, MetadataItem, MetadataRecommendation, MetadataViewModel } from './models/metadata.model';
import { FeatureComponentBase } from '../features/shared/base-feature.component';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
})
export class MetadataComponent extends BaseComponent implements OnInit, OnDestroy {
  gridOptions = this.buildGridOptions();

  private metadataSet$ = new BehaviorSubject<MetadataDto>({ Items: [], Recommendations: [] } as MetadataDto);
  private itemFor$ = new BehaviorSubject<EavFor | undefined>(undefined);
  private fabOpen$ = new BehaviorSubject(false);
  private targetType = parseInt(this.route.snapshot.paramMap.get('targetType'), 10);
  private keyType = this.route.snapshot.paramMap.get('keyType') as MetadataKeyType;
  private key = this.route.snapshot.paramMap.get('key');
  title = decodeURIComponent(this.route.snapshot.paramMap.get('title') ?? '');
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  viewModel$: Observable<MetadataViewModel>;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<MetadataComponent>,

    private metadataService: MetadataService,
    private snackBar: MatSnackBar,
    private entitiesService: EntitiesService,
    private contentItemsService: ContentItemsService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(router, route);
  }

  ngOnInit() {
    this.fetchFor();
    this.fetchMetadata();
    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { this.fetchMetadata(); }));

    const filteredRecs$ = this.metadataSet$.pipe(
      map((set) => set.Recommendations.filter(r => set.Items.filter(i => i._Type.Id === r.Id).length < r.Count)),
    );

    this.viewModel$ = combineLatest([this.metadataSet$, filteredRecs$, this.itemFor$, this.fabOpen$]).pipe(
      map(([metadata, recommendations, itemFor, fabOpen]) => {
        const viewModel: MetadataViewModel = {
          metadata: metadata.Items,
          recommendations,
          itemFor,
          fabOpen,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    this.metadataSet$.complete();
    this.itemFor$.complete();
    this.fabOpen$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openChange(open: boolean) {
    this.fabOpen$.next(open);
  }

  createMetadata(recommendation?: MetadataRecommendation) {
    if (recommendation) {
      // If the feature is not enabled, open the info dialog instead of metadata
      if (!recommendation.Enabled) {
        FeatureComponentBase.openDialog(this.dialog, recommendation.MissingFeature, this.viewContainerRef, this.changeDetectorRef);
        return;
      }
      // Feature is enabled, check if it's an empty metadata
      if (recommendation.CreateEmpty) {
        this.snackBar.open(`Creating ${recommendation.Name}...`);
        this.entitiesService.create(recommendation.Id, { For: this.calculateItemFor() }).subscribe({
          error: () => {
            this.snackBar.open(`Creating ${recommendation.Name} failed. Please check console for more info`, undefined, { duration: 3000 });
            this.fetchMetadata();
          },
          next: () => {
            this.snackBar.open(`Created ${recommendation.Name}`, undefined, { duration: 3000 });
            this.fetchMetadata();
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
      if (contentType == null) { return; }
      this.createMetadataForm(contentType);
    });
  }

  private createMetadataForm(contentType: string) {
    const form: EditForm = {
      items: [{
        ContentTypeName: contentType,
        For: this.calculateItemFor(),
      }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
    this.changeDetectorRef.markForCheck();
  }

  private calculateItemFor(): EavFor {
    const itemFor: EavFor = {
      Target: Object.values(eavConstants.metadata).find(m => m.targetType === this.targetType)?.target ?? this.targetType.toString(),
      TargetType: this.targetType,
      ...(this.keyType === eavConstants.keyTypes.guid && { Guid: this.key }),
      ...(this.keyType === eavConstants.keyTypes.number && { Number: parseInt(this.key, 10) }),
      ...(this.keyType === eavConstants.keyTypes.string && { String: this.key }),
    };
    return itemFor;
  }

  private fetchFor() {
    if (!this.contentTypeStaticName) { return; }

    this.contentItemsService.getAll(this.contentTypeStaticName).subscribe(items => {
      const item = items.find(i => i.Guid === this.key);
      if (item?.For) {
        this.itemFor$.next(item.For);
      }
    });
  }

  private fetchMetadata() {
    this.metadataService.getMetadata(this.targetType, this.keyType, this.key).pipe(
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
      })
    ).subscribe(this.metadataSet$);
  }

  private editMetadata(metadata: MetadataItem) {
    const form: EditForm = {
      items: [{ EntityId: metadata.Id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  private deleteMetadata(metadata: MetadataItem, confirmed = false) {
    if (!confirmed) {
      const data: ConfirmDeleteDialogData = {
        entityId: metadata.Id,
        entityTitle: metadata.Title,
        message: this.metadataSet$.value.Recommendations.find(r => r.Id === metadata._Type.Id)?.DeleteWarning,
      };
      const confirmationDialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
        autoFocus: false,
        data,
        viewContainerRef: this.viewContainerRef,
        width: '400px',
      });
      confirmationDialogRef.afterClosed().subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          this.deleteMetadata(metadata, true);
        }
      });
      return;
    }

    this.snackBar.open('Deleting...');
    this.entitiesService.delete(metadata._Type.Id, metadata.Id, false).subscribe({
      next: () => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.fetchMetadata();
      },
      error: () => {
        this.snackBar.open('Delete failed. Please check console for more information', null, { duration: 3000 });
      }
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const metadata: MetadataItem = params.data;
            return metadata.Id;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<MetadataItem> = {
              tooltipGetter: (metadata: MetadataItem) => `ID: ${metadata.Id}\nGUID: ${metadata.Guid}`,
            };
            return params;
          })(),
        },
        {
          field: 'Title',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const metadata: MetadataItem = params.data;
            return metadata.Title;
          },
          onCellClicked: (params) => {
            const metadata: MetadataItem = params.data;
            this.editMetadata(metadata);
          },
        },
        {
          headerName: 'Content Type',
          field: 'ContentType',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const metadata: MetadataItem = params.data;
            return `${metadata._Type.Name}${metadata._Type.Title !== metadata._Type.Name ? ` (${metadata._Type.Title})` : ''}`;
          },
          cellRenderer: MetadataContentTypeComponent,
        },
        {
          width: 42,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: MetadataActionsComponent,
          cellRendererParams: (() => {
            const params: MetadataActionsParams = {
              onDelete: (metadata) => this.deleteMetadata(metadata),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
