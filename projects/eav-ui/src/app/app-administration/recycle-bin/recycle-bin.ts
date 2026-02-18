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
  ]
})
export class AppRecycleBin {

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

  expandedItems: Record<number, boolean> = {};

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

  toggleExpandItem(expanded: boolean, itemId: number): void {
    this.expandedItems[itemId] = expanded;
  }

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