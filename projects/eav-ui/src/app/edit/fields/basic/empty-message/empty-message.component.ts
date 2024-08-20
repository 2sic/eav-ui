import { Component, inject } from '@angular/core';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: InputTypeConstants.EmptyMessage,
  templateUrl: './empty-message.component.html',
  styleUrls: ['./empty-message.component.scss'],
  standalone: true,
  imports: [SafeHtmlPipe,],
})
// TODO: @2dm - remove empty FieldMetadata as not needed any more
@FieldMetadata({ /* This is needed for the field to work */ })
export class EmptyMessageComponent {

  protected fieldState = inject(FieldState);
  protected basics = this.fieldState.basics;

}
