import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { BaseSubsinkComponent } from '../../../shared/components/base-subsink-component/base-subsink.component';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Field, FieldSysSettings } from '../../models/field.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';

@Component({
  selector: 'app-share-or-inherit-dialog',
  templateUrl: './share-or-inherit-dialog.component.html',
  styleUrls: ['./share-or-inherit-dialog.component.scss']
})
export class ShareOrInheritDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {

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
    if (this.dialogData.SysSettings?.Share) {

    } else if (this.dialogData.SysSettings?.InheritMetadataOf) {

    } else {
      const shareableFields$ = this.contentTypesFieldsService.getShareableFields();
      this.viewModel$ = combineLatest([
        shareableFields$
      ]).pipe(
        map(([shareableFields]) => {
          this.shareableFields$.next(shareableFields);
          return { shareableFields };
        })
      );
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

}

export interface ShareOrInheritDialogViewModel {
  shareableFields: Field[];
}
