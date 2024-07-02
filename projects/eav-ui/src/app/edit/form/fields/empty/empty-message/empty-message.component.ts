import { Component, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { SafeHtmlPipe } from 'projects/eav-ui/src/app/shared/pipes/safe-html.pipe';

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
