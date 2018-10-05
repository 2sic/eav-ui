import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdminDialogData } from '../../../shared/models/eav/admin-dialog-data';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';

@Component({
  selector: 'app-save-status-dialog',
  templateUrl: './save-status-dialog.component.html',
  styleUrls: ['./save-status-dialog.component.scss']
})
export class SaveStatusDialogComponent implements OnInit {

  versioningOptions;
  publishMode: string;
  private eavConfig: EavConfiguration;

  constructor(public dialogRef: MatDialogRef<SaveStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private formDialogData: AdminDialogData,
    private eavService: EavService) {
    // Read configuration from queryString
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    console.log('SaveStatusDialogComponent', this.formDialogData);
  }

  publishEntry() {
    console.log('publish entry');
    this.publishMode = 'show';
    this.dialogRef.close();
  }

  hideEntry() {
    console.log('hide entry');
    this.publishMode = 'hide';
    this.dialogRef.close();
  }

  saveAsDraftEntry() {
    console.log('save as draft entry');
    this.publishMode = 'branch';
    this.dialogRef.close();
  }

  private getVersioningOptions() {
    if (!this.eavConfig.partOfPage) {
      return { show: true, hide: true, branch: true };
    }
    const req = this.eavConfig.publishing || '';
    switch (req) {
      case '':
      case 'DraftOptional': return { show: true, hide: true, branch: true };
      case 'DraftRequired': return { branch: true, hide: true };
      default: throw Error('invalid versioning requiremenets: ' + req.toString());
    }
  }

}
