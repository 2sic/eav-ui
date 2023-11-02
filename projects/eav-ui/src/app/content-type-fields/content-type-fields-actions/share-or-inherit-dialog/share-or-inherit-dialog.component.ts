import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { BaseSubsinkComponent } from '../../../shared/components/base-subsink-component/base-subsink.component';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Field } from '../../models/field.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { ShareOrInheritDialogViewModel, SharingOrInheriting } from './share-or-inherit-dialog-models';

@Component({
  selector: 'app-share-or-inherit-dialog',
  templateUrl: './share-or-inherit-dialog.component.html',
  styleUrls: ['./share-or-inherit-dialog.component.scss']
})
export class ShareOrInheritDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type', 'share'];
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
    this.dialogRef.close({ state: SharingOrInheriting.Sharing, guid: null });
  }

  inheritField(field: Field) {
    this.dialogRef.close({ state: SharingOrInheriting.Inheriting, guid: field.Guid });
  }

  closeDialog() {
    this.dialogRef.close({ state: SharingOrInheriting.None, guid: null });
  }
}
