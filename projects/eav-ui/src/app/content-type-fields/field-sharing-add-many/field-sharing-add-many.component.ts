import { ChangeDetectorRef, Component, HostBinding, Inject, OnInit, ViewChild, ViewContainerRef, computed, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, concatMap, filter, of, toArray } from 'rxjs';
import { transient } from '../../../../../core';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ContentType } from '../../app-administration/models';
import { FeatureNames } from '../../features/feature-names';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { FeaturesService } from '../../features/features.service';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { BaseComponent } from '../../shared/components/base.component';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { signalObj } from '../../shared/signals/signal.utilities';
import { ReservedNamesValidatorDirective } from '../edit-content-type-fields/reserved-names.directive';

@Component({
  selector: 'app-field-sharing-add-many',
  templateUrl: './field-sharing-add-many.component.html',
  styleUrls: ['./field-sharing-add-many.component.scss'],
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReservedNamesValidatorDirective,
    MatDialogActions,
    TranslateModule,
    FeatureTextInfoComponent,
    FieldHintComponent,
  ]
})
export class FieldSharingAddMany extends BaseComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;

  #features = inject(FeaturesService);

  #contentTypesFieldsSvc = transient(ContentTypesFieldsService);

  ContentTypeFieldsReuseDefinitions = FeatureNames.ContentTypeFieldsReuseDefinitions;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: { contentType: ContentType, existingFields: Field[] },
    protected dialog: MatDialogRef<FieldSharingAddMany>,
    private snackBar: MatSnackBar,
    // All this is just for the feature dialog
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
    this.dialog.disableClose = true;
    this.subscriptions.add(
      this.dialog.backdropClick().subscribe(() => {
        if (this.form.dirty || this.selectedFields.data.length > 0) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) return;
        }
        this.dialog.close();
      })
    );
  }

  optionsColumns: string[] = ['contentType', 'name', 'type', 'share'];
  selectedColumns: string[] = ['newName', 'source', 'remove'];

  protected shareableFields = new MatTableDataSource<Field>([]);
  protected selectedFields = new MatTableDataSource<NewNameField>([]);
  protected fieldNamePattern = fieldNamePattern;
  protected fieldNameError = fieldNameError;

  #reservedNamesSystem = this.#contentTypesFieldsSvc.getReservedNames().value;

  reservedNames = computed(() => {
    const reserved = this.#reservedNamesSystem();
    return ReservedNamesValidatorDirective.mergeReserved(reserved, this.dialogData.existingFields);
  });

  protected saving = signalObj('saving', false);

  #fieldShareConfigManagement = this.#features.isEnabled[FeatureNames.ContentTypeFieldsReuseDefinitions];

  ngOnInit() {

    this.#contentTypesFieldsSvc.getShareableFieldsPromise().then(fields => {
      this.shareableFields.data = fields;
    });

  }

  selectField(field: Field) {
    this.selectedFields.data = [...this.selectedFields.data, { newName: field.StaticName, field }];
  }

  removeField(field: NewNameField) {
    const selectedFields = this.selectedFields.data;
    selectedFields.splice(selectedFields.indexOf(field), 1);
    this.selectedFields.data = [...selectedFields];
  }

  // When API gets created we will need to send the selected fields to the API
  save() {
    if (!this.#fieldShareConfigManagement()) {
      openFeatureDialog(this.matDialog, FeatureNames.ContentTypeFieldsReuseDefinitions, this.viewContainerRef, this.changeDetectorRef);
    } else {
      this.saving.set(true);
      this.snackBar.open('Saving...');
      of(...this.selectedFields.data).pipe(
        filter(inheritField => !!inheritField.newName),
        concatMap(inheritField =>
          this.#contentTypesFieldsSvc.addInheritedField(
            this.dialogData.contentType.Id,
            inheritField.field.ContentType.Id,
            inheritField.field.Guid,
            inheritField.newName
          ).pipe(catchError(_ => of(null)))
        ),
        toArray(),
      ).subscribe(_ => {
        this.saving.set(false);
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.dialog.close();
      });
    }
  }
}

export interface AppSharingFieldsViewModel {
  shareableFields: Field[];
  selectedFields: Field[];
}

interface NewNameField {
  newName: string;
  field: Field;
}
