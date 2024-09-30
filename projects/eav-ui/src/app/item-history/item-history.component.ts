import { DatePipe } from '@angular/common';
import { Component, computed, HostBinding, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { transient } from '../core';
import { getHistoryItems } from './item-history.helpers';
import { CompareWith } from './models/compare-with.model';
import { ItemHistoryResult } from './models/item-history-result.model';
import { Version } from './models/version.model';
import { VersionsService } from './services/versions.service';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatExpansionModule,
    MatPaginatorModule,
    DatePipe,
  ],
})
export class ItemHistoryComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  pageSizeOptions = [10, 20, 50];
  expandedPanels: Record<string, boolean> = {};
  expandedAttributes: Record<string, boolean> = {};

  #itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);

  version = signal<Version[]>(undefined);
  page = signal<number>(1);
  pageSize = signal<number>(this.pageSizeOptions[0]);
  compareWith = signal<CompareWith>('live');
  historyItems = computed(() => getHistoryItems(this.version(), this.page(), this.pageSize(), this.compareWith()));

  private versionsService = transient(VersionsService);

  constructor(
    private dialog: MatDialogRef<ItemHistoryComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.versionsService.fetchVersions(this.#itemId).subscribe(versions => this.version.set(versions));
  }

  closeDialog() {
    this.dialog.close();
  }

  compareChange(newCompareWith: CompareWith) {
    this.compareWith.set(newCompareWith);
  }

  panelExpandedChange(expand: boolean, versionNumber: number) {
    this.expandedPanels[versionNumber] = expand;
  }

  attributeExpandedToggle(versionNumber: number, name: string) {
    this.expandedAttributes[versionNumber + name] = !this.expandedAttributes[versionNumber + name];
  }

  pageChange(event: PageEvent) {
    const newPage = event.pageIndex + 1;
    if (newPage !== this.page()) {
      this.expandedPanels = {};
      this.expandedAttributes = {};
      this.page.set(newPage);
    }
    const newPageSize = event.pageSize;
    if (newPageSize !== this.pageSize()) {
      this.pageSize.set(newPageSize);
    }
  }

  restore(changeId: number) {
    this.snackBar.open('Restoring previous version...');
    this.versionsService.restore(this.#itemId, changeId).subscribe(res => {
      this.snackBar.open('Previous version restored. Will reload edit dialog', null, { duration: 3000 });
      const result: ItemHistoryResult = {
        refreshEdit: true,
      };
      this.dialog.close(result);
    });
  }
}
