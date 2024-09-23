import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewContainerRef, inject, signal } from '@angular/core';
import { BaseComponent } from '../../shared/components/base.component';
import { Field } from '../../shared/fields/field.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { SharingOrInheriting } from './share-or-inherit-dialog-models';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { FeatureNames } from '../../features/feature-names';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeatureIconIndicatorComponent } from '../../features/feature-icon-indicator/feature-icon-indicator.component';
import { transient } from '../../core/transient';

@Component({
  selector: 'app-share-or-inherit-dialog',
  templateUrl: './share-or-inherit-dialog.component.html',
  styleUrls: ['./share-or-inherit-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    NgClass,
    TranslateModule,
    FeatureIconIndicatorComponent
  ],
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

  shareableFields = signal<Field[]>(undefined);

  public features = inject(FeaturesScopedService);
  #fieldShareConfigManagement = this.features.isEnabled[FeatureNames.FieldShareConfigManagement];

  private contentTypesFieldsService = transient(ContentTypesFieldsService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Field,
    private dialogRef: MatDialogRef<ShareOrInheritDialogComponent>,
    // All this is just for the feature dialog
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
      const shareableFieldsTemp$ = this.contentTypesFieldsService.getShareableFieldsFor(this.dialogData.AttributeId);

      shareableFieldsTemp$.subscribe((shareableFields) => {
        this.shareableFields.set(shareableFields);
      });

    } else if (this.initialState === SharingOrInheriting.Sharing) {
      this.title = 'SharingOrInheriting.TitleSharing';
      this.message = 'SharingOrInheriting.MessageSharing';
    } else if (this.initialState === SharingOrInheriting.Inheriting) {
      this.title = 'SharingOrInheriting.TitleInheriting';
      this.message = 'SharingOrInheriting.MessageInheriting';
    }
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
    if (!this.#fieldShareConfigManagement()) {
      openFeatureDialog(this.dialog, FeatureNames.FieldShareConfigManagement, this.viewContainerRef, this.changeDetectorRef);
      return;
    }

    if (this.state == SharingOrInheriting.Sharing) {
      this.subscriptions.add(this.contentTypesFieldsService.share(this.dialogData.Id)
        .subscribe(() => this.dialogRef.close()));
    } else if (this.state == SharingOrInheriting.Inheriting) {
      this.subscriptions.add(this.contentTypesFieldsService.inherit(this.dialogData.Id, this.guid)
        .subscribe(() => this.dialogRef.close()));
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
