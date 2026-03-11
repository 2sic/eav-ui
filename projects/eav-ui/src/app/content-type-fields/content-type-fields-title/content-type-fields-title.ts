import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { Field } from '../../shared/fields/field.model';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';

@Component({
  selector: 'app-content-type-fields-title',
  templateUrl: './content-type-fields-title.html',
  styleUrls: ['./content-type-fields-title.scss'],
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ]
})
export class ContentTypeFieldsTitleComponent
  extends AgGridCellRendererBaseComponent<Field, boolean, ContentTypeFieldsTitleParams> {

  get field(): Field { return this.data; }

  get isTitle(): boolean { return this.value; }
  
  get suitableForTitle(): boolean { return !InputTypeHelpers.isEmpty(this.field.InputType); }

  setTitle(): void {
    if (this.suitableForTitle)
      this.params.onSetTitle(this.field);
  }
}

export interface ContentTypeFieldsTitleParams {
  onSetTitle(field: Field): void;
}