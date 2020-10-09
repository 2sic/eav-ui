import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { getHistoryItems } from './item-history.helpers';
import { ItemHistoryResult } from './models/item-history-result.model';
import { Version } from './models/raw-version.model';
import { VersionsService } from './services/versions.service';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemHistoryComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);
  private versions$ = new BehaviorSubject<Version[]>(null);
  private pageSize = 10;
  private page$ = new BehaviorSubject(1);
  private historyItems$ = combineLatest([this.versions$, this.page$]).pipe(
    map(([versions, page]) => getHistoryItems(versions, page, this.pageSize)),
  );
  templateVars$ = combineLatest([this.versions$, this.historyItems$]).pipe(
    map(([versions, historyItems]) => ({
      length: versions?.length,
      pageSize: this.pageSize,
      historyItems,
    })),
  );

  constructor(
    private dialogRef: MatDialogRef<ItemHistoryComponent>,
    private route: ActivatedRoute,
    private versionsService: VersionsService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.versionsService.fetchVersions(this.itemId).subscribe(this.versions$);
  }

  ngOnDestroy() {
    this.versions$.complete();
    this.page$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  pageChange(event: PageEvent) {
    this.page$.next(event.pageIndex + 1);
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
