import { Component, computed, input } from '@angular/core';
import { FieldSettingsWithPickerSource } from '../../../../../../../edit-types/src/PickerSources';
import { FeatureIconComponent } from '../../../../features/feature-icon/feature-icon.component';
import { PickerItem } from '../models/picker-item.model';
import { PickerFeaturesItem } from '../picker-features.model';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { PickerItemButtonsComponent } from '../picker-item-buttons/picker-item-buttons.component';
import { PickerItemPreviewComponent } from '../picker-item-preview/picker-item-preview.component';

@Component({
  selector: 'app-picker-item-label',
  imports: [
    PickerItemPreviewComponent,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
    PickerItemButtonsComponent,
    FeatureIconComponent,
  ],
  templateUrl: './picker-item-label.component.html',
  styleUrl: './picker-item-label.component.scss'
})
export class PickerPreviewLabelComponent {
  /** The item to show the label/buttons for */
  item = input.required<PickerItem>();

  /** The item index, important for certain button actions */
  index = input<number>(0);

  /** Settings, mainly for the preview feature such as icon etc. */
  settings = input.required<FieldSettingsWithPickerSource>();

  /** UI Features can let the control determine that certain buttons shouldn't be available, eg. "remove" on radio-button */
  uiFeatures = input<Partial<PickerFeaturesItem>>(null);

  /** If the buttons should show or not - I believe ATM it's always true */
  show = input<boolean>(false);

  /** Show the action-buttons before the (i) buttons */
  actionsFirst = input<boolean>(false);

  featureWarnings = computed(() => {
    const conditions = this.item().rules;
    if (!conditions) return [];
    const list = conditions
      .split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith('warn-req=feature:'))
      .map(c => c.split(':')[1]);
    console.log('list', list);
    return list;
  }, { debugName: 'featureWarnings' });
}
