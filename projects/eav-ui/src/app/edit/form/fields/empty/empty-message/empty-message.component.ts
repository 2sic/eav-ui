import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';

@Component({
  selector: InputTypeConstants.EmptyMessage,
  templateUrl: './empty-message.component.html',
  styleUrls: ['./empty-message.component.scss'],
  standalone: true,
  imports: [SharedComponentsModule, AsyncPipe],
})
@FieldMetadata({ /* This is needed for the field to work */ })
export class EmptyMessageComponent extends BaseFieldComponent<null> implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;

}
