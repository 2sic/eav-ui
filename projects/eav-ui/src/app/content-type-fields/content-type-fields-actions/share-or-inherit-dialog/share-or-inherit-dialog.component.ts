import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { BaseSubsinkComponent } from '../../../shared/components/base-subsink-component/base-subsink.component';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Field, FieldSysSettings } from '../../models/field.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-share-or-inherit-dialog',
  templateUrl: './share-or-inherit-dialog.component.html',
  styleUrls: ['./share-or-inherit-dialog.component.scss']
})
export class ShareOrInheritDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  title: string;
  message: string;
  state: SharingOrInheriting;
  sharingOrInheriting = SharingOrInheriting;

  shareableFields$ = new BehaviorSubject<Field[]>(undefined);
  viewModel$: Observable<ShareOrInheritDialogViewModel>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Field,
    private dialogRef: MatDialogRef<ShareOrInheritDialogComponent>,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private translate: TranslateService,
  ) {
    super();
   }

  ngOnInit() {
    this.state = !this.dialogData.SysSettings || (!this.dialogData.SysSettings.Share && !this.dialogData.SysSettings.InheritMetadataOf)
      ? SharingOrInheriting.None
      : this.dialogData.SysSettings.Share
        ? SharingOrInheriting.Sharing
        : SharingOrInheriting.Inheriting;
    if (this.state === SharingOrInheriting.None) {
      this.title = 'SharingOrInheriting.TitleNone';
      const shareableFields$ = this.contentTypesFieldsService.getShareableFields();
      this.viewModel$ = combineLatest([
        shareableFields$
      ]).pipe(
        map(([shareableFields]) => {
          this.shareableFields$.next(shareableFields);
          return { shareableFields };
        })
      );
    } else if (this.state === SharingOrInheriting.Sharing) {
      this.title = 'SharingOrInheriting.TitleSharing';
      this.message = 'SharingOrInheriting.MessageSharing';
    } else if (this.state === SharingOrInheriting.Inheriting) {
      this.title = 'SharingOrInheriting.TitleInheriting';
      this.message = 'SharingOrInheriting.MessageInheriting';
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  share() {
    this.contentTypesFieldsService.share(this.dialogData.Id).subscribe(() => { 
      this.dialogRef.close();
    });
  }

  selectField(field: Field) {
    this.contentTypesFieldsService.inherit(this.dialogData.Id, field.Guid).subscribe(() => {
      this.dialogRef.close();
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

export interface ShareOrInheritDialogViewModel {
  shareableFields: Field[];
}

enum SharingOrInheriting {
  None,
  Sharing,
  Inheriting
}
