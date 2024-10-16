import { DatePipe } from '@angular/common';
import { Component, HostBinding, signal } from '@angular/core';
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
import { transient } from '../../../../core';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { computedObj, signalObj } from '../shared/signals/signal.utilities';
import { getHistoryItems } from './item-history.helpers';
import { CompareWith } from './models/compare-with.model';
import { ItemHistoryResult } from './models/item-history-result.model';
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
    TippyDirective,
  ],
})
export class ItemHistoryComponent {
  @HostBinding('className') hostClass = 'dialog-component';

  #versionsService = transient(VersionsService);

  constructor(
    protected dialog: MatDialogRef<ItemHistoryComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
  }
  
  #itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);
  version = this.#versionsService.fetchVersions(this.#itemId);

  pageSizeOptions = [10, 20, 50];
  expandedPanels: Record<string, boolean> = {};
  expandedAttributes: Record<string, boolean> = {};


  #page = signal<number>(1);
  pageSize = signalObj<number>('pageSize', this.pageSizeOptions[0]);
  compareWith = signal<CompareWith>('live');
  historyItems = computedObj('historyItems', () => getHistoryItems(this.version(), this.#page(), this.pageSize(), this.compareWith()));

  compareChange(newCompareWith: CompareWith) {
    this.compareWith.set(newCompareWith);
  }

  panelExpandedChange(expand: boolean, versionNumber: number) {
    this.expandedPanels[versionNumber] = expand;
  }

  attributeExpandedToggle(versionNumber: number, name: string) {
    this.expandedAttributes[versionNumber + name] = !this.expandedAttributes[versionNumber + name];
  }

  getLocalDate(date: string) {
    return new Date(date);
  }

  pageChange(event: PageEvent) {
    const newPage = event.pageIndex + 1;
    if (newPage !== this.#page()) {
      this.expandedPanels = {};
      this.expandedAttributes = {};
      this.#page.set(newPage);
    }
    this.pageSize.set(event.pageSize);
  }

  restore(changeId: number) {
    this.snackBar.open('Restoring previous version...');
    this.#versionsService.restore(this.#itemId, changeId).subscribe(_ => {
      this.snackBar.open('Previous version restored. Will reload edit dialog', null, { duration: 3000 });
      this.dialog.close({
        refreshEdit: true,
      } satisfies ItemHistoryResult);
    });
  }
}
