import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { PickerItem } from '../models/picker-item.model';
import { PickerPartBaseComponent } from '../picker-part-base.component';

@Component({
  standalone: true,
  selector: 'app-picker-item-buttons',
  templateUrl: './picker-item-buttons.component.html',
  styleUrl: './picker-item-buttons.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TippyDirective,
    ClickStopPropagationDirective,
  ],
})
export class PickerItemButtonsComponent extends PickerPartBaseComponent {

  show = input.required<boolean>();

  item = input.required<PickerItem>();

  index = input.required<number>();

  constructor() { super(); }

  /** Current applicable settings like "enableEdit" etc. */
  settings = computedObj('settings', () => {
    // note that selected can be null, since a item in the list can be null
    const item = this.item();
    const show = this.show() && !!item;
    const s = this.fieldState.settings();
    return {
      enableEdit: s.EnableEdit && show && !item?.noEdit,
      enableDelete: s.EnableDelete && show && !item?.noDelete,
      enableRemove: s.EnableRemove && show,
    };
  });
  

  edit(entityGuid: string, entityId: number): void {
    this.log.a(`edit guid: '${entityGuid}'; id: '${entityId}'`);
    this.pickerData.source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.log.a(`removeItem index: '${index}'`);
    this.pickerData.state.remove(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.log.a(`deleteItem index: '${index}'; entityGuid: '${entityGuid}'`);
    this.pickerData.source.deleteItem({ index, entityGuid });
  }

}
