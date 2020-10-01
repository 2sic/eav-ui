import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemHistoryComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private itemId: number = parseInt(this.route.snapshot.paramMap.get('itemId'), 10);

  constructor(private dialogRef: MatDialogRef<ItemHistoryComponent>, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
