import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ContentTypesService } from '../../app-administration/shared/services/content-types.service';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { ContentType } from '../../app-administration/shared/models/content-type.model';
import { Field, FieldInputTypeOption } from '../models/field.model';
import { calculateDataTypes, DataType } from './edit-content-type-fields.helpers';
import { contentTypeNamePattern, contentTypeNameError } from '../../app-administration/shared/constants/content-type';
import { calculateTypeIcon } from '../content-type-fields.helpers';
import { InputTypesConstants } from '../constants/input-type.constants';

@Component({
  selector: 'app-edit-content-type-fields',
  templateUrl: './edit-content-type-fields.component.html',
  styleUrls: ['./edit-content-type-fields.component.scss']
})
export class EditContentTypeFieldsComponent implements OnInit {
  fields: Partial<Field>[];
  editMode: boolean;
  dataTypes: DataType[];
  inputTypeOptions: FieldInputTypeOption[];
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];
  dataTypeHints: string[] = [];
  inputTypeHints: string[] = [];
  contentTypeNamePattern = contentTypeNamePattern;
  contentTypeNameError = contentTypeNameError;

  private contentTypeStaticName: string;
  private contentType: ContentType;

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
  ) {
    this.contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  }

  async ngOnInit() {
    this.contentType = await this.contentTypesService.retrieveContentType(this.contentTypeStaticName).toPromise();
    const allFields = await this.contentTypesFieldsService.getFields(this.contentType).toPromise();
    const editFieldId = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id'), 10) : null;
    this.editMode = (editFieldId !== null);
    const rawDataTypes = await this.contentTypesFieldsService.typeListRetrieve().toPromise();
    this.dataTypes = calculateDataTypes(rawDataTypes);
    this.inputTypeOptions = await this.contentTypesFieldsService.getInputTypesList().toPromise();

    if (this.editMode) {
      const editField = allFields.find(field => field.Id === editFieldId);
      this.fields = [editField];
    } else {
      this.fields = [];
      for (let i = 1; i <= 8; i++) {
        this.fields.push({
          Id: 0,
          Type: 'String',
          InputType: 'string-default',
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
  }

  closeDialog() {
    this.dialogRef.close();
  }

  resetInputType(index: number) {
    this.fields[index].InputType = this.fields[index].Type.toLowerCase() + InputTypesConstants.defaultSuffix;
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

  async onSubmit() {
    this.snackBar.open('Saving...');
    if (this.editMode) {
      const res = await this.contentTypesFieldsService
        .updateInputType(this.fields[0].Id, this.fields[0].StaticName, this.fields[0].InputType)
        .toPromise();
    } else {
      const rowsWithValue = this.fields.filter(field => field.StaticName);
      for (const rowWithValue of rowsWithValue) {
        await this.contentTypesFieldsService.add(rowWithValue, this.contentType.Id).toPromise();
      }
    }
    this.snackBar.open('Saved', null, { duration: 2000 });
    this.closeDialog();
  }

  findIcon(typeName: string) {
    return calculateTypeIcon(typeName);
  }
}
