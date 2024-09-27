import { NgClass } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../core/transient';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { BaseComponent } from '../../shared/components/base.component';
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { SharingOrInheriting } from './share-or-inherit-dialog-models';

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
    FeatureTextInfoComponent,
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

  shareableFields = signal<Field[]>(undefined);

  #contentTypesFieldsSvc = transient(ContentTypesFieldsService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Field,
    protected dialog: MatDialogRef<ShareOrInheritDialogComponent>,
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
      this.#contentTypesFieldsSvc.getShareableFieldsFor(this.dialogData.AttributeId)
        .subscribe(fields => this.shareableFields.set(fields));

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
  }

  chooseInherit() {
    this.guid = null;
    this.state = SharingOrInheriting.Inheriting;
  }

  inheritField(field: Field) {
    this.guid = field.Guid;
  }

  save() {
    if (this.state == SharingOrInheriting.Sharing) {
      this.subscriptions.add(this.#contentTypesFieldsSvc.share(this.dialogData.Id)
        .subscribe(() => this.dialog.close()));
    } else if (this.state == SharingOrInheriting.Inheriting) {
      this.subscriptions.add(this.#contentTypesFieldsSvc.inherit(this.dialogData.Id, this.guid)
        .subscribe(() => this.dialog.close()));
    }
  }

}
