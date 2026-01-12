import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { Field } from '../../shared/fields/field.model';

@Component({
  selector: 'app-content-type-fields-special',
  templateUrl: './content-type-fields-special.html',
  styleUrls: ['./content-type-fields-special.scss'],
  imports: [
    MatIconModule,
    TippyDirective,
  ]
})
export class ContentTypeFieldsSpecialComponent implements ICellRendererAngularComp {
  hasFormulas: boolean;
  isEphemeral: boolean;
  isHidden: boolean;
  disableTranslation: boolean;
  disabled: boolean;
  required: boolean;

  agInit(params: ICellRendererParams) {
    const field: Field = params.data;
    this.hasFormulas = field.HasFormulas;
    this.isEphemeral = field.IsEphemeral;
    this.isHidden = !field.Metadata.All?.VisibleInEditUI;
    this.disableTranslation = field.Metadata.All?.DisableTranslation || false;
    this.disabled = field.Metadata.All?.Disabled || false;
    this.required = field.Metadata.All?.Required || false;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
