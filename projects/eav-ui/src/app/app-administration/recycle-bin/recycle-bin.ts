import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import dayjs, { Dayjs } from 'dayjs';
import { transient } from 'projects/core';
import { MatDayjsModule } from '../../edit/shared/date-adapters/date-adapter-api';
import { FeatureIconComponent } from '../../features/feature-icon/feature-icon';
import { FeatureSummary } from '../../features/models';
import { Context } from '../../shared/services/context';
import { SysDataService } from '../../shared/services/sys-data.service';

type DeletedEntity = {
  parentRef: string;
  appId: number;
  modified: string;
  guid: string | null;
  created: string;
  id: number;
  deletedTransactionId: number;
  contentTypeStaticName: string;
  deletedBy: string;
  deletedUtc: string;
  contentTypeName: string;
  title: string | null;
};

@Component({
  selector: 'recycle-bin',
  templateUrl: './recycle-bin.html',
  styleUrls: ['./recycle-bin.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatDayjsModule,
    FeatureIconComponent,
  ]
})
export class AppRecycleBin {

  #dataSvc = transient(SysDataService);
  #context = inject(Context);
  #http = inject(HttpClient);

  #refresh = signal(0);

  #defaultRangeEnd = dayjs().endOf('day');
  #defaultRangeStart = dayjs().subtract(6, 'day').startOf('day');

  dateRangeStart = signal<Dayjs | null>(this.#defaultRangeStart);
  dateRangeEnd = signal<Dayjs | null>(this.#defaultRangeEnd);

  selectedContentType = signal<string>('');

  #dataParams = computed(() => {
    const params: Record<string, unknown> = {};
    const start = this.dateRangeStart();
    const end = this.dateRangeEnd();
    const contentType = this.selectedContentType();

    if (start) params['DateFrom'] = start.toISOString();
    if (end) params['DateTo'] = end.toISOString();
    if (contentType) params['ContentType'] = contentType;

    return params;
  });

  // Get the data and the feature information in one go, so we can use the feature information for filtering or other purposes in the future if needed
  // Note that it's an httpResource, so it may still be loading, and the value may be null at the beginning
  // Note: WIP, maybe not needed for the recycle bin
  #data = this.#dataSvc.getMany<{ default: DeletedEntity[], feature: FeatureSummary[] }>({
    source: 'f890bec1-dee8-4ed6-9f2e-8ad412d2f4dc', // Recycle Bin DataSource internal ID
    refresh: this.#refresh,
    streams: 'Default,Feature',
    params: this.#dataParams,
  });

  // Get deleted entities from the backend
  // #allDeletedEntities = this.#dataSvc.get<DeletedEntity>({
  //   source: 'f890bec1-dee8-4ed6-9f2e-8ad412d2f4dc', // Recycle Bin DataSource internal ID
  //   refresh: this.#refresh,
  //   streams: 'Default,Feature',
  // });

  // Filter entities based on selected content type
  deletedEntities = computed(() => {
    const all = this.#data.value()?.default ?? []; // may still be loading...
    const filter = this.selectedContentType();
    return (!filter)
     ? all
     : all.filter(e => (e.contentTypeName || e.contentTypeStaticName) === filter);
  });

  // Get unique content types for the filter dropdown
  contentTypes = computed(() => {
    const all = this.#data.value()?.default ?? []; // may still be loading...
    const types = new Set(all.map(e => e.contentTypeName));
    return Array.from(types).sort();
  });

  displayedColumns: string[] = ['Title', 'ContentTypeName', 'DeletedBy', 'DeletedUtc', 'actions'];

  onContentTypeChange(contentType: string): void {
    this.selectedContentType.set(contentType || '');
    this.#refresh.set(this.#refresh() + 1);
  }

  onDateRangeChange(kind: 'start' | 'end', event: MatDatepickerInputEvent<Dayjs>): void {
    const value = event.value ?? null;
    if (kind === 'start') {
      this.dateRangeStart.set(value);
    } else {
      this.dateRangeEnd.set(value);
    }
    this.#refresh.set(this.#refresh() + 1);
  }

  restore(item: DeletedEntity): void {
    if (!confirm(`Are you sure you want to restore "${item.title || '(no title)'}"?`)) {
      return;
    }

    const url = `admin/data/recycle?appid=${this.#context.appId}&transactionid=${item.deletedTransactionId}`;
    
    this.#http.post(url, {}, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Data restored successfully');
        this.#refresh.set(this.#refresh() + 1);
      },
      error: (error) => {
        console.error('Error restoring data:', error);
        alert('Error restoring data: ' + (error.message || 'Unknown error'));
      }
    });
  }

}