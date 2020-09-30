import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content-item-snippets',
  templateUrl: './content-item-snippets.component.html',
  styleUrls: ['./content-item-snippets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentItemSnippetsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private contentTypeStaticName = this.route.snapshot.parent.paramMap.get('contentTypeStaticName');
  private itemId = this.route.snapshot.paramMap.get('itemId');

  constructor(private dialogRef: MatDialogRef<ContentItemSnippetsComponent>, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
