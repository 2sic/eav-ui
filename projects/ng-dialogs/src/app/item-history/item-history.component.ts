import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
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
  templateVars$ = combineLatest([this.versions$]).pipe(
    map(([versions]) => ({ versions })),
  );
  private itemId = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);

  constructor(
    private dialogRef: MatDialogRef<ItemHistoryComponent>,
    private route: ActivatedRoute,
    private versionsService: VersionsService,
  ) { }

  ngOnInit() {
    this.versionsService.fetchVersions(this.itemId).subscribe(versions => {
      this.versions$.next(versions);
    });
  }

  ngOnDestroy() {
    this.versions$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  restore(changeId: number) {
    this.versionsService.restore(this.itemId, changeId).subscribe(res => {
      this.closeDialog();
    });
  }
}
