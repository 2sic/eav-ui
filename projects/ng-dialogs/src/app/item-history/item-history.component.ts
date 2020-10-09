import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { getHistoryItems } from './item-history.helpers';
import { ExpandedPanels } from './models/expanded-panels.models';
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

  pageSize = 10;
  expandedPanels: ExpandedPanels = {};
  expandedAttributes: ExpandedPanels = {};

  private itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);
  private versions$ = new BehaviorSubject<Version[]>(null);
  private page$ = new BehaviorSubject(1);
  private historyItems$ = combineLatest([this.versions$, this.page$]).pipe(
    map(([versions, page]) => getHistoryItems(versions, page, this.pageSize)),
  );
  templateVars$ = combineLatest([this.versions$, this.historyItems$]).pipe(
    map(([versions, historyItems]) => ({
      length: versions?.length,
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

  panelExpandedChange(expand: boolean, versionNumber: number) {
    this.expandedPanels[versionNumber] = expand;
  }

  attributeExpandedToggle(versionNumber: number, name: string) {
    this.expandedAttributes[versionNumber + name] = !this.expandedAttributes[versionNumber + name];
  }

  pageChange(event: PageEvent) {
    this.expandedPanels = {};
    this.expandedAttributes = {};
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
