import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { Field } from '../../shared/fields/field.model';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { ContentTypeFieldsTitleParams } from './content-type-fields-title.models';

@Component({
    selector: 'app-content-type-fields-title',
    templateUrl: './content-type-fields-title.component.html',
    styleUrls: ['./content-type-fields-title.component.scss'],
    imports: [
        MatRippleModule,
        MatIconModule,
        TippyDirective,
    ]
})
export class ContentTypeFieldsTitleComponent implements ICellRendererAngularComp {

  isTitle: boolean;

  field: Field;

  suitableForTitle = true;

  private params: ICellRendererParams & ContentTypeFieldsTitleParams;

  agInit(params: ICellRendererParams & ContentTypeFieldsTitleParams): void {
    this.params = params;
    this.isTitle = params.value;
    this.field = params.data;

    this.suitableForTitle = !InputTypeHelpers.isEmpty(this.field.InputType)
  }

  refresh(params?: any): boolean {
    return true;
  }

  setTitle(): void {
    if (this.suitableForTitle)
      this.params.onSetTitle(this.field);
  }
}
