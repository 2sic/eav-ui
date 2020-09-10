import { Component, OnInit, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, mergeMap, share, catchError, toArray, filter, concatMap } from 'rxjs/operators';

import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { ContentType } from '../../app-administration/models/content-type.model';
import { Field, FieldInputTypeOption } from '../models/field.model';
import { calculateDataTypes, DataType } from './edit-content-type-fields.helpers';
import { fieldNamePattern, fieldNameError } from '../../app-administration/constants/field-name.patterns';
import { calculateTypeIcon } from '../content-type-fields.helpers';
import { InputTypeConstants } from '../constants/input-type.constants';
import { DataTypeConstants } from '../constants/data-type.constants';

@Component({
  selector: 'app-edit-content-type-fields',
  templateUrl: './edit-content-type-fields.component.html',
  styleUrls: ['./edit-content-type-fields.component.scss']
})
export class EditContentTypeFieldsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) form: NgForm;

  fields: Partial<Field>[] = [];
  editMode: boolean;
  dataTypes: DataType[];
  inputTypeOptions: FieldInputTypeOption[];
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];
  dataTypeHints: string[] = [];
  inputTypeHints: string[] = [];
  fieldNamePattern = fieldNamePattern;
  fieldNameError = fieldNameError;
  findIcon = calculateTypeIcon;

  private contentType: ContentType;
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
    const contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
    const editFieldId = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id'), 10) : null;
    this.editMode = (editFieldId !== null);

    const contentType$ = this.contentTypesService.retrieveContentType(contentTypeStaticName).pipe(share());
    const fields$ = contentType$.pipe(mergeMap(contentType => this.contentTypesFieldsService.getFields(contentType)));
    const dataTypes$ = this.contentTypesFieldsService.typeListRetrieve().pipe(map(rawDataTypes => calculateDataTypes(rawDataTypes)));
    const inputTypes$ = this.contentTypesFieldsService.getInputTypesList();

    forkJoin([contentType$, fields$, dataTypes$, inputTypes$]).subscribe(([contentType, fields, dataTypes, inputTypes]) => {
      this.contentType = contentType;
      const allFields = fields;
      this.dataTypes = dataTypes;
      this.inputTypeOptions = inputTypes;

      if (this.editMode) {
        const editField = allFields.find(field => field.Id === editFieldId);
        this.fields.push(editField);
      } else {
        for (let i = 1; i <= 8; i++) {
          this.fields.push({
            Id: 0,
            Type: DataTypeConstants.String,
            InputType: InputTypeConstants.StringDefault,
            StaticName: '',
            IsTitle: allFields.length === 0,
            SortOrder: allFields.length + i,
          });
        }
      }

      for (let i = 0; i < this.fields.length; i++) {
        this.calculateInputTypeOptions(i);
        this.calculateHints(i);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  resetInputType(index: number) {
    this.fields[index].InputType = this.fields[index].Type.toLowerCase() + InputTypeConstants.DefaultSuffix;
  }

  calculateInputTypeOptions(index: number) {
    this.filteredInputTypeOptions[index] = this.inputTypeOptions
      .filter(option => option.dataType === this.fields[index].Type.toLowerCase());
  }

  calculateHints(index: number) {
    const selectedDataType = this.dataTypes.find(dataType => dataType.name === this.fields[index].Type);
    const selectedInputType = this.inputTypeOptions.find(inputTypeOption => inputTypeOption.inputType === this.fields[index].InputType);
    this.dataTypeHints[index] = selectedDataType ? selectedDataType.description : '';
    this.inputTypeHints[index] = selectedInputType ? selectedInputType.description : '';
  }

  save() {
    this.snackBar.open('Saving...');
    if (this.editMode) {
      const field = this.fields[0];
      this.contentTypesFieldsService.updateInputType(field.Id, field.StaticName, field.InputType).subscribe(res => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.closeDialog();
      });
    } else {
      of(...this.fields).pipe(
        filter(field => !!field.StaticName),
        concatMap(field =>
          this.contentTypesFieldsService.add(field, this.contentType.Id).pipe(catchError(error => of(null)))
        ),
        toArray(),
      ).subscribe(responses => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.closeDialog();
      });
    }
  }
}
