import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemHistoryResult } from './item-history.models';
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

  private versions$ = new BehaviorSubject<Version[]>(null);
  private itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);
  templateVars$ = combineLatest([this.versions$]).pipe(
    map(([versions]) => ({ versions })),
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
  }

  closeDialog() {
    this.dialogRef.close();
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
