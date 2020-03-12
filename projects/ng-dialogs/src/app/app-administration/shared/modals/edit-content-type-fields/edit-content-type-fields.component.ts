import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

import { ContentTypesService } from '../../services/content-types.service';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { ContentType } from '../../models/content-type.model';
import { NewField, FieldInputTypeOption } from '../../models/field.model';
import { Context } from '../../../../shared/context/context';
import { calculateDataTypes, DataType, FieldWithHint, NewFieldWithHint } from './edit-content-type-fields.helpers';

@Component({
  selector: 'app-edit-content-type-fields',
  templateUrl: './edit-content-type-fields.component.html',
  styleUrls: ['./edit-content-type-fields.component.scss']
})
export class EditContentTypeFieldsComponent implements OnInit {
  editField: FieldWithHint;
  newFields: NewFieldWithHint[];
  dataTypes: DataType[];
  inputTypeOptions: FieldInputTypeOption[];
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];

  private contentTypeStaticName: string;
  private contentType: ContentType;

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private context: Context,
  ) {
    this.contentTypeStaticName = this.route.parent.snapshot.paramMap.get('contentTypeStaticName');
  }

  async ngOnInit() {
    this.contentType = await this.contentTypesService.retrieveContentType(this.contentTypeStaticName).toPromise();
    const allFields = await this.contentTypesFieldsService.getFields(this.contentType).toPromise();
    const editFieldId = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id'), 10) : null;
    const rawDataTypes = await this.contentTypesFieldsService.typeListRetrieve().toPromise();
    this.dataTypes = calculateDataTypes(rawDataTypes);
    this.inputTypeOptions = await this.contentTypesFieldsService.getInputTypesList().toPromise();

    if (!editFieldId) {
      this.newFields = [];
      for (let i = 1; i <= 8; i++) {
        const newField = new NewField(
          this.context.appId,
          this.contentType.Id,
          allFields.length === 0,
          allFields.length + i,
        );
        this.newFields.push({ ...newField, dataTypeHint: '', inputTypeHint: '' });
      }
      this.calculateInputTypeOptions(this.newFields);
      this.calculateHints(this.newFields);
    } else {
      const editField = allFields.find(field => field.Id === editFieldId);
      this.editField = { ...editField, dataTypeHint: '', inputTypeHint: '' };
      this.calculateInputTypeOptions([this.editField]);
      this.calculateHints([this.editField]);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  resetSubTypes(newField: NewFieldWithHint) {
    newField.InputType = newField.Type.toLowerCase() + '-default';
    this.calculateInputTypeOptions([newField]);
  }

  calculateHints(fields: NewFieldWithHint[] | FieldWithHint[]) {
    for (const field of fields) {
      const selectedDataType = this.dataTypes.find(dataType => dataType.name === field.Type);
      const selectedInputType = this.inputTypeOptions.find(inputTypeOption => inputTypeOption.inputType === field.InputType);
      field.dataTypeHint = selectedDataType ? selectedDataType.description : '';
      field.inputTypeHint = selectedInputType ? selectedInputType.description : '';
    }
  }

  async addFieldsSubmit() {
    const rowsWithValue = this.newFields.filter(field => field.StaticName);
    for (let i = 0; i < rowsWithValue.length; i++) {
      const newField = { ...rowsWithValue[i] };
      delete newField.dataTypeHint;
      delete newField.inputTypeHint;
      await this.contentTypesFieldsService.add(newField).toPromise();
    }
    this.closeDialog();
  }

  editFieldSubmit() {
    this.contentTypesFieldsService
      .updateInputType(this.editField.Id, this.editField.StaticName, this.editField.InputType)
      .subscribe(res => {
        this.closeDialog();
      });
  }

  private calculateInputTypeOptions(fields: NewFieldWithHint[] | FieldWithHint[]) {
    for (const field of fields) {
      this.filteredInputTypeOptions[field.SortOrder] = this.inputTypeOptions.filter(option =>
        option.dataType === field.Type.toLowerCase());
    }
  }
}
