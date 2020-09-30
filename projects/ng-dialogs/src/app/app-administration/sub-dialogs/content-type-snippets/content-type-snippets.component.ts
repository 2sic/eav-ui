import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content-type-snippets',
  templateUrl: './content-type-snippets.component.html',
  styleUrls: ['./content-type-snippets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeSnippetsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  constructor(private dialogRef: MatDialogRef<ContentTypeSnippetsComponent>, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
