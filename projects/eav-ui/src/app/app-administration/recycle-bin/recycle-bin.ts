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
import { FeatureIconComponent } from '../../features/feature-icon/feature-icon';
import { FeatureSummary } from '../../features/models';
import { getHistoryItems } from '../../item-history/item-history.helpers';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../../shared/services/context';
import { SysDataService } from '../../shared/services/sys-data.service';
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
    FeatureIconComponent,
    SxcGridModule,
    MatDialogModule,
  ]
})
export class AppRecycleBin {
  private dialog = inject(MatDialog);

  gridOptions: GridOptions = this.buildGridOptions();

  dataSourceData = computed(() =>
    this.deletedEntities().map((entity: any) => {
      if (entity.json) {
        try {
          const json = JSON.parse(entity.json);
          return {
            ...entity,
            realTitle: json?.Entity?.Attributes?.String?.Title?.['*'] || entity.title,
            realContentType: json?.Entity?.Type?.Name || entity.contentType,
          };
        } catch {
          return;
        }
      }
      return {
        ...entity,
        realTitle: entity.title,
        realContentType: entity.contentType,
      };
    })
  );

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
          headerName: 'Date',
          field: 'deleted',
          valueFormatter: (params: any) => params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '',
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
        if (event.colDef.headerName === 'Actions') {
          let targetElement = event.event.target;
          // Traverse up to find the element with data-action="restore"
          while (targetElement && targetElement !== event.event.currentTarget) {
            if (targetElement.dataset && targetElement.dataset.action === 'restore') {
              this.restore(event.data);
              return;
            }
            targetElement = targetElement.parentElement;
          }
        } else {
          this.onRowSelected(event.data);
        }
      },
    };
  }

  onRowSelected(item: DeletedEntity) {
    try {
      // Parse the deleted entity as a version
      const entity = JSON.parse(item.json).Entity;
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
      this.dialog.open(SingleHistoryDialogComponent, {
        width: '900px',
        maxHeight: '80vh',
        data: historyItems && historyItems.length > 0 ? historyItems[0] : null,
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
        ...(start ? { DateFrom: start.startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') } : {}),
        ...(end ? { DateTo: end.endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') } : {}),
        ...(this.selectedContentType() ? { ContentType: this.selectedContentType() } : {}),
      };
    }),
  });

  deletedEntities = computed(() => this.#data.value()?.default ?? []);

  contentTypes = computed(() => this.#data.value()?.contentTypes ?? []);

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