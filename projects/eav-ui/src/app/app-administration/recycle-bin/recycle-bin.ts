import { GridOptions } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { HistoryItemComponent } from '../../item-history/history-item';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../../shared/services/context';
import { SysDataService } from '../../shared/services/sys-data.service';



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
    HistoryItemComponent,
  ]
})
export class AppRecycleBin {
  // ag-Grid integration
  gridOptions: GridOptions = this.buildGridOptions();

  selectedDeletedEntity: DeletedEntity | null = null;
  selectedHistoryItem: any = null; // Will be set to the parsed history item

  dataSourceData = computed(() => {
    return this.deletedEntities();
  });

  private buildGridOptions(): GridOptions {
    return {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Title',
          field: 'title',
          flex: 2,
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Content Type',
          field: 'contentTypeStaticName',
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
          ...ColumnDefinitions.ActionsPinnedRight3,
          headerName: 'Actions',
          cellRenderer: (params: any) => {
            return `<button class='ag-btn ag-btn-primary' data-action='restore'>Restore</button>`;
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
    this.selectedDeletedEntity = item;
    // Try to parse the JSON field (assuming it's called 'json' on the item)
    if (item && (item as any).json) {
      try {
        this.selectedHistoryItem = JSON.parse((item as any).json);
      } catch (e) {
        this.selectedHistoryItem = null;
      }
    } else {
      this.selectedHistoryItem = null;
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

    const url = `admin/data/recycle?appid=${this.#context.appId}&transactionid=${item.deletedTransactionId}`;
    
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

  // toggleExpandItem(expanded: boolean, itemId: number): void {
  //   this.expandedItems[itemId] = expanded;
  // }

}

type DeletedEntity = {
  parentRef: string;
  appId: number;
  guid: string | null;
  id: number;
  deletedTransactionId: number;
  contentTypeStaticName: string;
  deletedBy: string;
  title: string | null;
};

type ContentTypeInfo = {
  name: string;
  staticName: string;
  count: number;
  title: string;
};