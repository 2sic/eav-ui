import { GridOptions } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import dayjs, { Dayjs } from 'dayjs';
import { transient } from 'projects/core';
import { MatDayjsModule } from '../../edit/shared/date-adapters/date-adapter-api';
import { FeatureInfoBoxComponent } from '../../features/feature-info-box/feature-info-box';
import { FeatureIconWithDialogComponent } from '../../features/icons/feature-icon-with-dialog';
import { FeatureSummary } from '../../features/models';
import { getHistoryItems } from '../../item-history/item-history.helpers';
import { HistoryAttributeValue, HistoryItem } from '../../item-history/models/history-item.model';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../../shared/services/context';
import { SysDataService } from '../../shared/services/sys-data.service';
import { GoToRecycleBin } from './go-to-recycle-bin';
import { SingleHistoryDialogComponent } from './single-history-dialog';



const RECYCLE_BIN_DATASOURCE_ID = 'f890bec1-dee8-4ed6-9f2e-8ad412d2f4dc';

@Component({
  selector: 'recycle-bin',
  templateUrl: './recycle-bin.html',
  styleUrls: ['./recycle-bin.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDayjsModule,
    FeatureIconWithDialogComponent,
    FeatureInfoBoxComponent,
    SxcGridModule,
    MatDialogModule,
  ]
})
export class AppRecycleBin {
  private dialog = inject(MatDialog);

  gridOptions: GridOptions = this.buildGridOptions();
  selectedDeletedEntity: DeletedEntity | null = null;
  selectedHistoryItem: any = null; // Will be set to the parsed history item

  dataSourceData = computed(() => {
    // Parse and enrich each entity with realTitle and realContentType from JSON
    return this.deletedEntities().map((entity: any) => {
      if (entity.json) {
        try {
          const json = JSON.parse(entity.json);
          entity.realTitle = json?.Entity?.Attributes?.String?.Title?.['*'] || entity.title;
          entity.realContentType = json?.Entity?.Type?.Name || entity.contentType;
        } catch {
          entity.realTitle = entity.title;
          entity.realContentType = entity.contentType;
        }
      } else {
        entity.realTitle = entity.title;
        entity.realContentType = entity.contentType;
      }
      return entity;
    });
  });

  GoToRecycleBin = GoToRecycleBin;

  private buildGridOptions(): GridOptions {
    return {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Title',
          field: 'realTitle',
          flex: 2,
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Content Type',
          field: 'realContentType',
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Deleted By',
          field: 'deletedBy',
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Item ID',
          field: 'id',
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight4,
          headerName: 'Actions',
          cellRenderer: (params: any) => {
            return `
                  <div class="eav-grid-action-button highlight" data-action="restore" matRipple tippy="Restore" style="display: inline-flex; align-items: center; gap: 6px; padding: 0 28px;">
                    <span class="material-symbols-outlined">autorenew</span>
                    <span>Restore</span>
                  </div>
                `;
          },
        },
      ],
      onCellClicked: (event: any) => {
        if (event.colDef.headerName === 'Actions' && event.event.target?.dataset?.action === 'restore') {
          this.restore(event.data);
        } else if (event.colDef.headerName !== 'Actions') {
          this.onRowSelected(event.data);
        }
      },
    };
  }

  onRowSelected(item: DeletedEntity) {
    try {
      // Parse the deleted entity as a version
      const parsed = JSON.parse(item.json);
      const entity = parsed?.Entity;
      // Build a Version object
      const version = {
        ChangeSetId: 0,
        HistoryId: entity?.Id ?? item.id,
        Json: item.json,
        TimeStamp: item.deleted,
        User: item.deletedBy,
        VersionNumber: entity?.Version ?? 1
      };
      // Use getHistoryItems to process the data
      // We use a single version, so pass [version] and itself as versions
      const historyItems = getHistoryItems([version], 1, 1, 'live');
      const historyItem = historyItems && historyItems.length > 0 ? historyItems[0] : null;
      this.dialog.open(SingleHistoryDialogComponent, {
        width: '900px',
        maxHeight: '80vh',
        data: historyItem
      });
    } catch (error) {
      console.error('Invalid deleted entity JSON', error);
    }
  }

  #dataSvc = transient(SysDataService);
  #context = inject(Context);
  #http = inject(HttpClient);

  #refresh = signal(0);

  #defaultRangeEnd = dayjs().endOf('day');
  #defaultRangeStart = dayjs().subtract(6, 'day').startOf('day');

  dateRangeStart = model<Dayjs | null>(this.#defaultRangeStart);
  dateRangeEnd = model<Dayjs | null>(this.#defaultRangeEnd);

  selectedContentType = model('');

  #data = this.#dataSvc.getMany<{ default: DeletedEntity[], feature: FeatureSummary[], contentTypes: ContentTypeInfo[] }>({
    source: RECYCLE_BIN_DATASOURCE_ID,
    refresh: this.#refresh,
    streams: 'Default,Feature,ContentTypes',
    params: computed(() => {
      const start = this.dateRangeStart();
      const end = this.dateRangeEnd();
      return {
        ...(start ? { DateFrom: start.startOf('day').toISOString() } : {}),
        ...(end ? { DateTo: end.endOf('day').toISOString() } : {}),
        ...(this.selectedContentType() ? { ContentType: this.selectedContentType() } : {}),
      };
    }),
  });

  deletedEntities = computed(() => this.#data.value()?.default ?? []);

  contentTypes = computed(() => this.#data.value()?.contentTypes ?? []);

  displayedColumns: string[] = ['Title', 'ContentTypeName', 'DeletedBy', 'DeletedUtc', 'actions'];

  // expandedItems: Record<number, boolean> = {};

  restore(item: DeletedEntity): void {
    if (!confirm(`Are you sure you want to restore "${item.title || '(no title)'}"?`)) {
      return;
    }

    const url = `admin/data/recycle?appid=${this.#context.appId}&transactionid=${item.transactionId}`;

    this.#http.post(url, {}, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Data restored successfully');
        this.#refresh.update(v => v + 1);
      },
      error: (error) => {
        console.error('Error restoring data:', error);
        alert(`Error restoring data: ${error.message || 'Unknown error'}`);
      }
    });
  }

  private buildHistoryItemFromDeletedEntity(
    item: DeletedEntity
  ): HistoryItem {

    const parsed = JSON.parse(item.json);
    const entity = parsed?.Entity;

    const attributes = Object.entries(entity?.Attributes ?? {})
      .flatMap(([dataType, attributeGroup]: any) => {
        return Object.entries(attributeGroup).map(
          ([attributeName, values]: any) => ({
            name: attributeName,
            dataType,
            change: 'deleted' as const,
            values: Object.entries(values).map(
              ([langKey, val]): HistoryAttributeValue => ({
                langKey,
                value: null,
                oldValue: val,
                change: 'deleted'
              })
            )
          })
        );
      });

    return {
      attributes,
      changeSetId: 0, // Not applicable for deleted items
      historyId: entity?.Id ?? item.id,
      timeStamp: item.deleted,
      user: item.deletedBy,
      versionNumber: entity?.Version ?? 1,
      isLastVersion: true
    };
  }

}

type DeletedEntity = {
  parentRef: string;
  appId: number;
  guid: string | null;
  id: number;
  transactionId: number;
  contentType: string;
  deletedBy: string;
  title: string | null;
  deleted: string;
  json: string;
};

type ContentTypeInfo = {
  name: string;
  staticName: string;
  count: number;
  title: string;
};