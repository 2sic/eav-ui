import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldsSettingsService } from '../../../../shared/services';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { EmptyMessageViewModel } from './empty-message.models';
import { ItemFieldVisibility } from '../../../../shared/services/item-field-visibility';
import { AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

@Component({
  selector: InputTypeConstants.EmptyMessage,
  templateUrl: './empty-message.component.html',
  styleUrls: ['./empty-message.component.scss'],
  standalone: true,
  imports: [SharedComponentsModule, AsyncPipe],
})
@FieldMetadata({ /* This is needed for the field to work */ })
export class EmptyMessageComponent implements OnInit {
  @Input() config: FieldConfigSet;

  viewModel: Observable<EmptyMessageViewModel>;

  constructor(private fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit() {
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        Notes: settings.Notes,
        Visible: ItemFieldVisibility.mergedVisible(settings),
      })),
      distinctUntilChanged(RxHelpers.objectsEqual),
    );
    this.viewModel = combineLatest([settings$]).pipe(
      map(([settings]) => {
        const viewModel: EmptyMessageViewModel = {
          notes: settings.Notes,
          visible: settings.Visible,
        };
        return viewModel;
      }),
    );
  }
}
