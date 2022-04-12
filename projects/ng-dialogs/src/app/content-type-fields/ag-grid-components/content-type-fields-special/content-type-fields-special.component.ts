import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-content-type-fields-special',
  templateUrl: './content-type-fields-special.component.html',
  styleUrls: ['./content-type-fields-special.component.scss'],
})
export class ContentTypeFieldsSpecialComponent implements ICellRendererAngularComp {
  hasFormulas: boolean;
  isEphemeral: boolean;

  agInit(params: ICellRendererParams) {
    const field: Field = params.data;
    this.hasFormulas = field.HasFormulas;
    this.isEphemeral = field.IsEphemeral;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
