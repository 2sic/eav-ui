import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, catchError, concatMap, filter, of, toArray } from 'rxjs';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ContentType } from '../../app-administration/models';
import { transient } from '../../core';
import { FeatureIconIndicatorComponent } from '../../features/feature-icon-indicator/feature-icon-indicator.component';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { BaseComponent } from '../../shared/components/base.component';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { ReservedNamesValidatorDirective } from '../edit-content-type-fields/reserved-names.directive';

@Component({
  selector: 'app-add-sharing-fields',
  templateUrl: './add-sharing-fields.component.html',
  styleUrls: ['./add-sharing-fields.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReservedNamesValidatorDirective,
    MatDialogActions,
    AsyncPipe,
    TranslateModule,
    FeatureIconIndicatorComponent,
    FieldHintComponent,
  ],
})
export class AddSharingFieldsComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;

  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type', 'share'];
  displayedSelectedFieldsColumns: string[] = ['newName', 'source', 'remove'];

  protected shareableFields = new MatTableDataSource<Field>([]);
  protected selectedFields = new MatTableDataSource<NewNameField>([]);
  protected fieldNamePattern = fieldNamePattern;
  protected fieldNameError = fieldNameError;
  protected reservedNames: Record<string, string> = {};

  protected saving$ = new BehaviorSubject(false);

  #features = inject(FeaturesScopedService);

  #contentTypesFieldsSvc = transient(ContentTypesFieldsService);

  #fieldShareConfigManagement = this.#features.isEnabled[FeatureNames.ContentTypeFieldsReuseDefinitions];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: { contentType: ContentType, existingFields: Field[] },
    private dialogRef: MatDialogRef<AddSharingFieldsComponent>,
    private snackBar: MatSnackBar,
    // All this is just for the feature dialog
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
    this.dialogRef.disableClose = true;
    this.subscriptions.add(
      this.dialogRef.backdropClick().subscribe(() => {
        if (this.form.dirty || this.selectedFields.data.length > 0) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) return;
        }
        this.closeDialog();
      })
    );
  }

  ngOnInit() {
    // TODO: @SDV Try to find a better way to do this
    this.subscriptions.add(
      this.#contentTypesFieldsSvc.getShareableFields()
        .subscribe(shareableFields => {
          this.shareableFields.data = shareableFields;
        })
    );
    this.subscriptions.add(
      this.#contentTypesFieldsSvc.getReservedNames()
        .subscribe(reservedNames => {
          this.reservedNames = ReservedNamesValidatorDirective.assembleReservedNames(reservedNames, this.dialogData.existingFields);
        })
    );
  }


  ngOnDestroy() {
    this.saving$.complete();
    super.ngOnDestroy();
  }

  // TODO: @SDV Try to find a better way to do this
  selectField(field: Field) {
    const selectedFields = this.selectedFields.data;
    selectedFields.push({ newName: field.StaticName, field });
    this.selectedFields.data = selectedFields;

  }

  // TODO: @SDV Try to find a better way to do this
  removeField(field: NewNameField) {
    const selectedFields = this.selectedFields.data;
    selectedFields.splice(selectedFields.indexOf(field), 1);
    this.selectedFields.data = selectedFields;
  }

  // When API gets created we will need to send the selected fields to the API
  save() {
    if (!this.#fieldShareConfigManagement()) {
      openFeatureDialog(this.dialog, FeatureNames.ContentTypeFieldsReuseDefinitions, this.viewContainerRef, this.changeDetectorRef);
    } else {
      this.saving$.next(true);
      this.snackBar.open('Saving...');
      of(...this.selectedFields.data).pipe(
        filter(inheritField => !!inheritField.newName),
        concatMap(inheritField =>
          this.#contentTypesFieldsSvc.addInheritedField(
            this.dialogData.contentType.Id,
            inheritField.field.ContentType.Id,
            inheritField.field.Guid,
            inheritField.newName
          ).pipe(catchError(error => of(null)))
        ),
        toArray(),
      ).subscribe(responses => {
        this.saving$.next(false);
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.closeDialog();
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
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
