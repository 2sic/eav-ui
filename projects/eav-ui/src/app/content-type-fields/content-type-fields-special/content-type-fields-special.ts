import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
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
export class ContentTypeFieldsSpecialComponent
  extends AgGridCellRendererBaseComponent<Field, unknown> {

  get field(): Field { return this.data; }
  get hasFormulas(): boolean { return this.field.HasFormulas; }
  get isEphemeral(): boolean { return this.field.IsEphemeral; }
  get isHidden(): boolean { return !this.field.Metadata.All?.VisibleInEditUI; }
  get disableTranslation(): boolean { return this.field.Metadata.All?.DisableTranslation ?? false; }
  get disabled(): boolean { return this.field.Metadata.All?.Disabled ?? false; }
  get required(): boolean { return this.field.Metadata.All?.Required ?? false; }

}