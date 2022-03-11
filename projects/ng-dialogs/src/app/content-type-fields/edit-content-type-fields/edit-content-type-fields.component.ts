import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, of, Subscription } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap, share, toArray } from 'rxjs/operators';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ContentType } from '../../app-administration/models/content-type.model';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { DataTypeConstants } from '../constants/data-type.constants';
import { InputTypeConstants } from '../constants/input-type.constants';
import { calculateTypeIcon } from '../content-type-fields.helpers';
import { Field, FieldInputTypeOption } from '../models/field.model';
import { ReservedNames } from '../models/reserved-names.model';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { calculateDataTypes, DataType } from './edit-content-type-fields.helpers';

@Component({
  selector: 'app-edit-content-type-fields',
  templateUrl: './edit-content-type-fields.component.html',
  styleUrls: ['./edit-content-type-fields.component.scss'],
})
export class EditContentTypeFieldsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;

  fields: Partial<Field>[] = [];
  reservedNames: ReservedNames;
  editMode: 'name' | 'inputType';
  dataTypes: DataType[];
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];
  dataTypeHints: string[] = [];
  inputTypeHints: string[] = [];
  fieldNamePattern = fieldNamePattern;
  fieldNameError = fieldNameError;
  findIcon = calculateTypeIcon;
  loading$ = new BehaviorSubject(true);
  saving$ = new BehaviorSubject(false);

  private contentType: ContentType;
  private inputTypeOptions: FieldInputTypeOption[];
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
  ) {
    this.dialogRef.disableClose = true;
    this.subscription.add(
      this.dialogRef.backdropClick().subscribe(event => {
        if (this.form.dirty) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) { return; }
        }
        this.closeDialog();
      })
    );
  }

  ngOnInit() {
    this.editMode = this.route.snapshot.paramMap.get('editMode') as 'name' | 'inputType';

    const contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
    const contentType$ = this.contentTypesService.retrieveContentType(contentTypeStaticName).pipe(share());
    const fields$ = contentType$.pipe(mergeMap(contentType => this.contentTypesFieldsService.getFields(contentType.StaticName)));
    const dataTypes$ = this.contentTypesFieldsService.typeListRetrieve().pipe(map(rawDataTypes => calculateDataTypes(rawDataTypes)));
    const inputTypes$ = this.contentTypesFieldsService.getInputTypesList();
    const reservedNames$ = this.contentTypesFieldsService.getReservedNames();

    forkJoin([contentType$, fields$, dataTypes$, inputTypes$, reservedNames$]).subscribe(
      ([contentType, fields, dataTypes, inputTypes, reservedNames]) => {
        this.contentType = contentType;
        this.dataTypes = dataTypes;
        this.inputTypeOptions = inputTypes;

        const existingFields: ReservedNames = {};
        fields.forEach(field => {
          existingFields[field.StaticName] = 'Field with this name already exists';
        });
        this.reservedNames = {
          ...reservedNames,
          ...existingFields,
        };

        if (this.editMode != null) {
          const editFieldId = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id'), 10) : null;
          const editField = fields.find(field => field.Id === editFieldId);
          if (this.editMode === 'name') {
            delete this.reservedNames[editField.StaticName];
          }
          this.fields.push(editField);
        } else {
          for (let i = 1; i <= 8; i++) {
            this.fields.push({
              Id: 0,
              Type: DataTypeConstants.String,
              InputType: InputTypeConstants.StringDefault,
              StaticName: '',
              IsTitle: fields.length === 0,
              SortOrder: fields.length + i,
            });
          }
        }

        for (let i = 0; i < this.fields.length; i++) {
          this.filterInputTypeOptions(i);
          this.calculateHints(i);
        }
        this.loading$.next(false);
      }
    );
  }

  ngOnDestroy() {
    this.loading$.complete();
    this.saving$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  filterInputTypeOptions(index: number) {
    this.filteredInputTypeOptions[index] = this.inputTypeOptions.filter(
      option => option.dataType === this.fields[index].Type.toLocaleLowerCase()
    );
  }

  resetInputType(index: number) {
    let defaultInputType = this.fields[index].Type.toLocaleLowerCase() + InputTypeConstants.DefaultSuffix;
    const defaultExists = this.filteredInputTypeOptions[index].some(option => option.inputType === defaultInputType);
    if (!defaultExists) {
      defaultInputType = this.filteredInputTypeOptions[index][0].inputType;
    }
    this.fields[index].InputType = defaultInputType;
  }

  calculateHints(index: number) {
    const selectedDataType = this.dataTypes.find(dataType => dataType.name === this.fields[index].Type);
    const selectedInputType = this.inputTypeOptions.find(inputTypeOption => inputTypeOption.inputType === this.fields[index].InputType);
    this.dataTypeHints[index] = selectedDataType?.description ?? '';
    this.inputTypeHints[index] = selectedInputType?.isObsolete
      ? `OBSOLETE - ${selectedInputType.obsoleteMessage}`
      : selectedInputType?.description ?? '';
  }

  getInputTypeOption(inputName: string) {
    return this.inputTypeOptions.find(option => option.inputType === inputName);
  }

  save() {
    this.saving$.next(true);
    this.snackBar.open('Saving...');
    if (this.editMode != null) {
      const field = this.fields[0];
      if (this.editMode === 'name') {
        this.contentTypesFieldsService.rename(field.Id, this.contentType.Id, field.StaticName).subscribe(() => {
          this.saving$.next(false);
          this.snackBar.open('Saved', null, { duration: 2000 });
          this.closeDialog();
        });
      } else if (this.editMode === 'inputType') {
        this.contentTypesFieldsService.updateInputType(field.Id, field.StaticName, field.InputType).subscribe(() => {
          this.saving$.next(false);
          this.snackBar.open('Saved', null, { duration: 2000 });
          this.closeDialog();
        });
      }
    } else {
      of(...this.fields).pipe(
        filter(field => !!field.StaticName),
        concatMap(field =>
          this.contentTypesFieldsService.add(field, this.contentType.Id).pipe(catchError(error => of(null)))
        ),
        toArray(),
      ).subscribe(responses => {
        this.saving$.next(false);
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.closeDialog();
      });
    }
  }
}
