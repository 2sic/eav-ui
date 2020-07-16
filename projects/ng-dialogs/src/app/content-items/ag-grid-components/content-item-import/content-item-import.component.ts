import { Component, OnInit, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { ContentItemsService } from '../../services/content-items.service';

@Component({
  selector: 'app-content-item-import',
  templateUrl: './content-item-import.component.html',
  styleUrls: ['./content-item-import.component.scss']
})
export class ContentItemImportComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  private viewStates = {
    Default: 1,
    Waiting: 2,
    Imported: 3
  };
  viewState = this.viewStates.Default;
  importFile: File;

  constructor(private dialogRef: MatDialogRef<ContentItemImportComponent>, private contentItemsService: ContentItemsService) { }

  ngOnInit() {
  }

  async importContentItem() {
    this.viewState = this.viewStates.Waiting;
    (await this.contentItemsService.importItem(this.importFile)).subscribe({
      next: res => {
        this.viewState = this.viewStates.Imported;
      },
      error: () => {
        this.viewState = this.viewStates.Default;
      }
    });
  }

  fileChange(event: Event) {
    this.importFile = (event.target as HTMLInputElement).files[0];
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
