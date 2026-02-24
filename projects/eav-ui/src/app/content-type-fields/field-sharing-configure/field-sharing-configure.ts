import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import groupBy from 'lodash-es/groupBy';
import { transient } from '../../../../../core/transient';
import { classLog } from '../../../../../shared/logging';
import { FeatureInfoBoxComponent } from '../../features/feature-info-box/feature-info-box';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesService } from '../../features/features.service';
import { FeatureIconWithDialogComponent } from '../../features/icons/feature-icon-with-dialog';
import { DialogHeaderComponent } from "../../shared/dialog-header/dialog-header";
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { SaveCloseButtonFabComponent } from '../../shared/modules/save-close-button-fab/save-close-button-fab';
import { computedObj, signalObj } from '../../shared/signals/signal.utilities';
import { SharingOrInheriting } from './field-sharing-configure.enums';

const logSpecs = {
  all: true,
  constructor: true,
}

const noInheritGuid = '00000000-0000-0000-0000-000000000000';

@Component({
  selector: 'app-field-sharing-configure',
  templateUrl: './field-sharing-configure.html',
  styleUrls: ['./field-sharing-configure.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    NgClass,
    NgTemplateOutlet,
    TranslateModule,
    FeatureInfoBoxComponent,
    FeatureIconWithDialogComponent,
    MatDialogActions,
    SaveCloseButtonFabComponent,
    DialogHeaderComponent
]
})
export class ShareOrInheritDialogComponent {

  log = classLog({ ShareOrInheritDialogComponent }, logSpecs);

  #contentTypesFieldsSvc = transient(ContentTypesFieldsService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Field,
    public features: FeaturesService,
    protected dialog: MatDialogRef<ShareOrInheritDialogComponent>,
  ) {
    const l = this.log.fnIf('constructor', { dialogData });

    const sysS = dialogData.SysSettings;
    if (sysS) {
      if (sysS.Share)
        this.#contentTypesFieldsSvc.getDescendants(dialogData.Id)
          .then(fields => this.details.set(fields));
      else if (sysS.InheritMetadataOf)
        this.#contentTypesFieldsSvc.getAncestors(dialogData.Id)
          .then(fields => this.details.set(fields));
    }
  }

  requiredFeature = FeatureNames.ContentTypeFieldsReuseDefinitions;

  details = signalObj<Field[]>('details', []);

  optionsColumns: string[] = ['contentType', 'name', 'type'];
  message: string;
  state: SharingOrInheriting = SharingOrInheriting.None;

  // Constants for the UI
  sharingOrInheriting = SharingOrInheriting;
  guid: string = null;

  shareableFields = signal<Field[]>(undefined);

  // Figure out the initial state how at the time of opening the dialog
  initialState: SharingOrInheriting = (() => {
    const sysS = this.dialogData.SysSettings;
    const notConfigured = !sysS || (!sysS.Share && !sysS.InheritMetadataOf);
    return notConfigured
      ? SharingOrInheriting.None
      : sysS.Share
        ? SharingOrInheriting.Sharing
        : SharingOrInheriting.Inheriting;
  })();

  // Assemble i18n title part, using the current state name
  title: string = 'SharingOrInheriting.Title' + this.sharingOrInheriting[this.initialState];

  /** Prepare info about inheritance, which is kind of compacted into a string */
  #inheritsInfo = computedObj('inheritsInfo', () => {
    const parts = this.dialogData.SysSettings.InheritMetadataOf.split(',');
    const withFieldNames = parts.map(complete => ({
      complete,
      // Guid, required, could be empty-guid
      guid: complete.substring(0, 36),
      // Field name, optional; only required if it's the no-inherit guid
      name: complete.substring(36),
    }));
    return groupBy(withFieldNames, g => g.guid === noInheritGuid ? 'none' : 'inherits');
  });

  /** Metadata content-type names which are not inherited */
  notInherited = computedObj('notInherited', () => this.#inheritsInfo().none?.map(n => n.name) ?? []);

  /** Metadata items which are inherited */
  inherited = computedObj('inherited', () => this.#inheritsInfo().inherits ?? []);

  setShare() {
    this.guid = null;
    this.state = SharingOrInheriting.Sharing;
  }

  startInherit() {
    this.guid = null;
    this.state = SharingOrInheriting.Inheriting;

    // Load possible fields which match the current field type
    this.#contentTypesFieldsSvc.getShareableFieldsFor(this.dialogData.AttributeId)
      .then(fields => this.shareableFields.set(fields));
  }

  inheritField(field: Field) {
    this.guid = field.Guid;
  }

  save() {
    if (this.state == SharingOrInheriting.Sharing) {
      this.#contentTypesFieldsSvc.share(this.dialogData.Id)
        .subscribe(() => this.dialog.close());
    } else if (this.state == SharingOrInheriting.Inheriting) {
      this.#contentTypesFieldsSvc.inherit(this.dialogData.Id, this.guid)
        .subscribe(() => this.dialog.close());
    }
  }

}
