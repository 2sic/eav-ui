import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

import { ContentTypesService } from '../../services/content-types.service';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { ContentType } from '../../models/content-type.model';
import { Field, NewField, FieldInputTypeOption } from '../../models/field.model';
import { Context } from '../../../../shared/context/context';

@Component({
  selector: 'app-content-types-fields-add',
  templateUrl: './edit-content-type-fields.component.html',
  styleUrls: ['./edit-content-type-fields.component.scss']
})
export class EditContentTypeFieldsComponent implements OnInit {
  fields: Field[];
  newFields: NewField[];
  dataTypes: string[];
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
    this.fields = await this.contentTypesFieldsService.getFields(this.contentType).toPromise();
    this.dataTypes = await this.contentTypesFieldsService.typeListRetrieve().toPromise();
    this.inputTypeOptions = await this.contentTypesFieldsService.getInputTypesList().toPromise();

    this.newFields = [];
    for (let i = 1; i <= 10; i++) {
      this.newFields.push(new NewField(
        this.context.appId,
        this.contentType.Id,
        this.fields.length === 0,
        this.fields.length + i,
      ));
    }
    this.calculateInputTypeOptions(this.newFields);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  resetSubTypes(newField: NewField) {
    newField.InputType = newField.Type.toLowerCase() + '-default';
    this.calculateInputTypeOptions([newField]);
  }

  async submit() {
    const rowsWithValue = this.newFields.filter(field => field.StaticName);
    for (let i = 0; i < rowsWithValue.length; i++) {
      await this.contentTypesFieldsService.add(rowsWithValue[i]).toPromise();
    }
    this.closeDialog();
  }

  private calculateInputTypeOptions(newFields: NewField[]) {
    newFields.forEach(newField => {
      this.filteredInputTypeOptions[newField.SortOrder] = this.inputTypeOptions.filter(option =>
        option.dataType === newField.Type.toLowerCase());
    });
  }
}
