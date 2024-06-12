import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { BaseComponent } from '../../shared/components/base.component';
import { BehaviorSubject, Observable, combineLatest, map, take } from 'rxjs';
import { Field } from '../models/field.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { ShareOrInheritDialogViewModel, SharingOrInheriting } from './share-or-inherit-dialog-models';
import { FeatureComponentBase } from '../../features/shared/base-feature.component';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureNames } from '../../features/feature-names';
import { TranslateModule } from '@ngx-translate/core';
import { FeaturesModule } from '../../features/features.module';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { FeatureIconIndicatorComponent } from '../../features/feature-icon-indicator/feature-icon-indicator.component';

@Component({
    selector: 'app-share-or-inherit-dialog',
    templateUrl: './share-or-inherit-dialog.component.html',
    styleUrls: ['./share-or-inherit-dialog.component.scss'],
    standalone: true,
    imports: [
      MatButtonModule,
      SharedComponentsModule,
      MatIconModule,
      MatCardModule,
      MatTableModule,
      NgClass,
      FeaturesModule,
      AsyncPipe,
      TranslateModule,
      FeatureIconIndicatorComponent
    ]
})
export class ShareOrInheritDialogComponent extends BaseComponent implements OnInit, OnDestroy {
  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type'];
  title: string;
  message: string;
  state: SharingOrInheriting = SharingOrInheriting.None;
  initialState: SharingOrInheriting = SharingOrInheriting.None;
  sharingOrInheriting = SharingOrInheriting;
  guid: string = null;
  isSaveDisabled: boolean = true;

  shareableFields$ = new BehaviorSubject<Field[]>(undefined);
  viewModel$: Observable<ShareOrInheritDialogViewModel>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Field,
    private dialogRef: MatDialogRef<ShareOrInheritDialogComponent>,
    private contentTypesFieldsService: ContentTypesFieldsService,
    // All this is just for the feature dialog
    private featuresService: FeaturesService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.initialState = !this.dialogData.SysSettings || (!this.dialogData.SysSettings.Share && !this.dialogData.SysSettings.InheritMetadataOf)
      ? SharingOrInheriting.None
      : this.dialogData.SysSettings.Share
        ? SharingOrInheriting.Sharing
        : SharingOrInheriting.Inheriting;
    if (this.initialState === SharingOrInheriting.None) {
      this.title = 'SharingOrInheriting.TitleNone';
      const shareableFields$ = this.contentTypesFieldsService.getShareableFieldsFor(this.dialogData.AttributeId);
      this.viewModel$ = combineLatest([
        shareableFields$
      ]).pipe(
        map(([shareableFields]) => {
          this.shareableFields$.next(shareableFields);
          return { shareableFields };
        })
      );
    } else if (this.initialState === SharingOrInheriting.Sharing) {
      this.title = 'SharingOrInheriting.TitleSharing';
      this.message = 'SharingOrInheriting.MessageSharing';
    } else if (this.initialState === SharingOrInheriting.Inheriting) {
      this.title = 'SharingOrInheriting.TitleInheriting';
      this.message = 'SharingOrInheriting.MessageInheriting';
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  chooseShare() {
    this.guid = null;
    this.state = SharingOrInheriting.Sharing;
    this.isSaveDisabled = false;
  }

  chooseInherit() {
    this.guid = null;
    this.state = SharingOrInheriting.Inheriting;
    this.isSaveDisabled = true;
  }

  inheritField(field: Field) {
    this.guid = field.Guid;
    this.isSaveDisabled = false;
  }

  save() {
    this.featuresService.isEnabled$(FeatureNames.FieldShareConfigManagement).pipe(
      take(1),
    ).subscribe(isEnabled => {
      if (!isEnabled) {
        FeatureComponentBase.openDialog(this.dialog, FeatureNames.FieldShareConfigManagement, this.viewContainerRef, this.changeDetectorRef);
      } else {
        if (this.state == SharingOrInheriting.Sharing) {
          this.subscription.add(this.contentTypesFieldsService.share(this.dialogData.Id)
            .subscribe(() => this.dialogRef.close()));
        } else if (this.state == SharingOrInheriting.Inheriting) {
          this.subscription.add(this.contentTypesFieldsService.inherit(this.dialogData.Id, this.guid)
            .subscribe(() => this.dialogRef.close()));
        }
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
