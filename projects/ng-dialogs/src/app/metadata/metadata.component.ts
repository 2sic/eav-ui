import { AllCommunityModules, CellClickedEvent, GridOptions } from '@ag-grid-community/all-modules';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { ContentItemFor } from '../content-items/models/content-item.model';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { MetadataService } from '../permissions';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { MetadataActionsComponent } from './ag-grid-components/metadata-actions/metadata-actions.component';
import { MetadataActionsParams } from './ag-grid-components/metadata-actions/metadata-actions.models';
import { MetadataSaveDialogComponent } from './metadata-save-dialog/metadata-save-dialog.component';
import { MetadataItem } from './models/metadata.model';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
})
export class MetadataComponent implements OnInit, OnDestroy {
  metadata$ = new BehaviorSubject<MetadataItem[]>(null);
  for?: ContentItemFor;

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      metadataActionsComponent: MetadataActionsComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        cellRendererParams: {
          tooltipGetter: (paramsData: MetadataItem) => `ID: ${paramsData.Id}\nGUID: ${paramsData.Guid}`,
        } as IdFieldParams,
      },
      {
        headerName: 'Title', field: 'Title', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, sort: 'asc', filter: 'agTextColumnFilter', onCellClicked: this.editMetadata.bind(this),
      },
      {
        headerName: 'Content Type', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', valueGetter: (params) => {
          const metadata = params.data as MetadataItem;
          return `${metadata._Type.Name}${metadata._Type.Description ? ` (${metadata._Type.Description})` : ''}`;
        },
      },
      {
        width: 40, cellClass: 'secondary-action no-padding', cellRenderer: 'metadataActionsComponent', pinned: 'right',
        cellRendererParams: {
          onDelete: this.deleteMetadata.bind(this),
        } as MetadataActionsParams,
      },
    ],
  };

  private subscription = new Subscription();
  private targetType = parseInt(this.route.snapshot.paramMap.get('type'), 10);
  private keyType = this.route.snapshot.paramMap.get('keyType') as MetadataKeyType;
  private key = this.route.snapshot.paramMap.get('key');
  title = decodeURIComponent(this.route.snapshot.paramMap.get('title') ?? '');
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  constructor(
    private dialogRef: MatDialogRef<MetadataComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private metadataService: MetadataService,
    private snackBar: MatSnackBar,
    private entitiesService: EntitiesService,
    private contentItemsService: ContentItemsService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.fetchFor();
    this.fetchMetadata();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.metadata$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createMetadata() {
    const metadataDialogRef = this.dialog.open(MetadataSaveDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    metadataDialogRef.afterClosed().subscribe((contentType?: string) => {
      if (contentType == null) { return; }

      const form: EditForm = {
        items: [{
          ContentTypeName: contentType,
          For: {
            Target:
              Object.values(eavConstants.metadata).find(option => option.type === this.targetType)?.target ?? this.targetType.toString(),
            ...(this.keyType === eavConstants.keyTypes.guid && { Guid: this.key }),
            ...(this.keyType === eavConstants.keyTypes.number && { Number: parseInt(this.key, 10) }),
            ...(this.keyType === eavConstants.keyTypes.string && { String: this.key }),
          },
        }],
      };
      const formUrl = convertFormToUrl(form);
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
      this.changeDetectorRef.markForCheck();
    });
  }

  private fetchFor() {
    if (!this.contentTypeStaticName) { return; }

    this.contentItemsService.getAll(this.contentTypeStaticName).subscribe(items => {
      const item = items.find(i => i.Guid === this.key);
      this.for = item?.For;
    });
  }

  private fetchMetadata() {
    this.metadataService.getMetadata(this.targetType, this.keyType, this.key).subscribe(metadata => {
      this.metadata$.next(metadata.Items);
    });
  }

  private editMetadata(params: CellClickedEvent) {
    const metadata: MetadataItem = params.data;
    const form: EditForm = {
      items: [{ EntityId: metadata.Id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  private deleteMetadata(metadata: MetadataItem) {
    if (!confirm(`Delete '${metadata.Title}' (${metadata.Id})?`)) { return; }

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

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchMetadata();
      })
    );
  }

}
