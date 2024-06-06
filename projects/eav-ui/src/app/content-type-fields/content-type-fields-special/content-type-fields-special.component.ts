import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Field } from '../models/field.model';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-content-type-fields-special',
    templateUrl: './content-type-fields-special.component.html',
    styleUrls: ['./content-type-fields-special.component.scss'],
    standalone: true,
    imports: [MatIconModule, SharedComponentsModule],
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
