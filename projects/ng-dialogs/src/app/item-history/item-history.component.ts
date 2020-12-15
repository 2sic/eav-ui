import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { getHistoryItems } from './item-history.helpers';
import { CompareWith } from './models/compare-with.model';
import { ExpandedPanels } from './models/expanded-panels.model';
import { ItemHistoryResult } from './models/item-history-result.model';
import { Version } from './models/version.model';
import { VersionsService } from './services/versions.service';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemHistoryComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  pageSizeOptions = [10, 20, 50];
  expandedPanels: ExpandedPanels = {};
  expandedAttributes: ExpandedPanels = {};

  private itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);
  private versions$ = new BehaviorSubject<Version[]>(null);
  private page$ = new BehaviorSubject(1);
  private pageSize$ = new BehaviorSubject(this.pageSizeOptions[0]);
  private compareWith$ = new BehaviorSubject<CompareWith>('live');
  private historyItems$ = combineLatest([this.versions$, this.page$, this.pageSize$, this.compareWith$]).pipe(
    map(([versions, page, pageSize, compareWith]) => getHistoryItems(versions, page, pageSize, compareWith)),
  );
  templateVars$ = combineLatest([this.versions$, this.historyItems$, this.pageSize$, this.compareWith$]).pipe(
    map(([versions, historyItems, pageSize, compareWith]) => ({
      length: versions?.length,
      historyItems,
      pageSize,
      compareWith,
    })),
  );

  constructor(
    private dialogRef: MatDialogRef<ItemHistoryComponent>,
    private route: ActivatedRoute,
    private versionsService: VersionsService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.versionsService.fetchVersions(this.itemId).subscribe(versions => {
      this.versions$.next(versions);
    });
  }

  ngOnDestroy() {
    this.versions$.complete();
    this.page$.complete();
    this.pageSize$.complete();
    this.compareWith$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  compareChange(newCompareWith: CompareWith) {
    this.compareWith$.next(newCompareWith);
  }

  panelExpandedChange(expand: boolean, versionNumber: number) {
    this.expandedPanels[versionNumber] = expand;
  }

  attributeExpandedToggle(versionNumber: number, name: string) {
    this.expandedAttributes[versionNumber + name] = !this.expandedAttributes[versionNumber + name];
  }

  pageChange(event: PageEvent) {
    const newPage = event.pageIndex + 1;
    if (newPage !== this.page$.value) {
      this.expandedPanels = {};
      this.expandedAttributes = {};
      this.page$.next(newPage);
    }
    const newPageSize = event.pageSize;
    if (newPageSize !== this.pageSize$.value) {
      this.pageSize$.next(newPageSize);
    }
  }

  restore(changeId: number) {
    this.snackBar.open('Restoring previous version...');
    this.versionsService.restore(this.itemId, changeId).subscribe(res => {
      this.snackBar.open('Previous version restored. Will reload edit dialog', null, { duration: 3000 });
      const result: ItemHistoryResult = {
        refreshEdit: true,
      };
      this.dialogRef.close(result);
    });
  }
}
