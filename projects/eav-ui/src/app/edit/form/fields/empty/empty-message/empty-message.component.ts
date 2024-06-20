import { Component, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { FieldState } from '../../../builder/fields-builder/field-state';

@Component({
  selector: InputTypeConstants.EmptyMessage,
  templateUrl: './empty-message.component.html',
  styleUrls: ['./empty-message.component.scss'],
  standalone: true,
  imports: [SharedComponentsModule],
})
// TODO: @2dm - remove empty FieldMetadata as not needed any more
@FieldMetadata({ /* This is needed for the field to work */ })
export class EmptyMessageComponent {

  protected fieldState = inject(FieldState);
  protected basics = this.fieldState.basics;

}
