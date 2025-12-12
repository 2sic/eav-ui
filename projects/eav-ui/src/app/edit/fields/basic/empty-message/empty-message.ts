import { Component, inject } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';

@Component({
    selector: InputTypeCatalog.EmptyMessage,
    templateUrl: './empty-message.html',
    styleUrls: ['./empty-message.scss'],
    imports: [SafeHtmlPipe,]
})
// TODO: @2dm - remove empty FieldMetadata as not needed any more
@FieldMetadata({ /* This is needed for the field to work */ })
export class EmptyMessageComponent {

  protected fieldState = inject(FieldState);
  protected basics = this.fieldState.basics;

}
