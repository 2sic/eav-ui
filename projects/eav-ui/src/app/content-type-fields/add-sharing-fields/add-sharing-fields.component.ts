import { ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BaseSubsinkComponent } from '../../shared/components/base-subsink-component/base-subsink.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Field } from '../models/field.model';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError, concatMap, filter, of, take, toArray } from 'rxjs';
import { ContentType } from '../../app-administration/models';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ReservedNames } from '../models/reserved-names.model';
import { NgForm } from '@angular/forms';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureNames } from '../../features/feature-names';
import { FeatureComponentBase } from '../../features/shared/base-feature.component';

@Component({
  selector: 'app-add-sharing-fields',
  templateUrl: './add-sharing-fields.component.html',
  styleUrls: ['./add-sharing-fields.component.scss']
})
export class AddSharingFieldsComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;
  
  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type', 'share'];
  displayedSelectedFieldsColumns: string[] = ['newName', 'source', 'remove'];

  shareableFields = new MatTableDataSource<Field>([]);
  selectedFields = new MatTableDataSource<NewNameField>([]);
  fieldNamePattern = fieldNamePattern;
  fieldNameError = fieldNameError;
  reservedNames: ReservedNames;

  saving$ = new BehaviorSubject(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: { contentType: ContentType, existingFields: Field[] },
    private dialogRef: MatDialogRef<AddSharingFieldsComponent>,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
    // All this is just for the feature dialog
    private featuresService: FeaturesService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
    this.dialogRef.disableClose = true;
    this.subscription.add(
      this.dialogRef.backdropClick().subscribe(() => {
        if (this.form.dirty || this.selectedFields.data.length > 0) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) { return; }
        }
        this.closeDialog();
      })
    );
  }

  ngOnInit() {
    // TODO: @SDV Try to find a better way to do this
    this.subscription = this.contentTypesFieldsService.getShareableFields().subscribe(shareableFields => {
      this.shareableFields.data = shareableFields;
    });
    this.subscription = this.contentTypesFieldsService.getReservedNames().subscribe(reservedNames => { 
      const existingFields: ReservedNames = {};
      this.dialogData.existingFields.forEach(field => {
        existingFields[field.StaticName] = 'Field with this name already exists';
      });
      this.reservedNames = {
        ...reservedNames,
        ...existingFields,
      };
    });
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
    this.featuresService.isEnabled$(FeatureNames.FieldShareConfigManagement).pipe(
      take(1),
    ).subscribe(isEnabled => {
      if (!isEnabled) {
        FeatureComponentBase.openDialog(this.dialog, FeatureNames.FieldShareConfigManagement, this.viewContainerRef, this.changeDetectorRef);
      } else {
        console.log("SDV - API not implemented yet", this.selectedFields.data);
        this.closeDialog();
        // this.saving$.next(true);
        // this.snackBar.open('Saving...');
        // of(...this.selectedFields.data).pipe(
        //   filter(inheritField => !!inheritField.newName),
        //   concatMap(inheritField =>
        //     // this.contentTypesFieldsService.add(field, this.contentType.Id).pipe(catchError(error => of(null)))
        //     this.contentTypesFieldsService.addInheritedField(
        //       this.dialogData.contentType.Id,
        //       inheritField.field.ContentType.Name,
        //       inheritField.field.Guid,
        //       inheritField.newName
        //     ).pipe(catchError(error => of(null)))
        //   ),
        //   toArray(),
        // ).subscribe(responses => {
        //   this.saving$.next(false);
        //   this.snackBar.open('Saved', null, { duration: 2000 });
        //   this.closeDialog();
        // });
       }
    });
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