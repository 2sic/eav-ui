import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { transient } from 'projects/core';
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
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ]
})
export class AppRecycleBin {

  #dataSvc = transient(SysDataService);
  #context = inject(Context);
  #http = inject(HttpClient);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  #refresh = signal(0);

  // Get content type from route
  #routeContentType = toSignal(this.#route.queryParamMap);
  selectedContentType = computed(() => this.#routeContentType()?.get('contentType') || '');

  // Get deleted entities from the backend
  #allDeletedEntities = this.#dataSvc.get<DeletedEntity>({
    source: 'f890bec1-dee8-4ed6-9f2e-8ad412d2f4dc', // Recycle Bin DataSource internal ID
    refresh: this.#refresh,
    streams: 'Default,Feature',
  });

  // Filter entities based on selected content type
  deletedEntities = computed(() => {
    const all = this.#allDeletedEntities();
    const filter = this.selectedContentType();
    if (!filter) return all;
    return all.filter(e => (e.contentTypeName || e.contentTypeStaticName) === filter);
  });

  // Get unique content types for the filter dropdown
  contentTypes = computed(() => {
    const all = this.#allDeletedEntities();
    const types = new Set(all.map(e => e.contentTypeName));
    return Array.from(types).sort();
  });

  displayedColumns: string[] = ['Title', 'ContentTypeName', 'DeletedBy', 'DeletedUtc', 'actions'];

  onContentTypeChange(contentType: string): void {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { contentType: contentType || null },
      queryParamsHandling: 'merge'
    });
  }

  restore(item: DeletedEntity): void {
    if (!confirm(`Are you sure you want to restore "${item.title || '(no title)'}"?`)) {
      return;
    }

    const url = `/api/2sxc/admin/data/recycle?appid=${this.#context.appId}&transactionid=${item.deletedTransactionId}`;
    
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