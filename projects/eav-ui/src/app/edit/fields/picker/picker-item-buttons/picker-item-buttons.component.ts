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
  selector: 'app-picker-item-buttons',
  templateUrl: './picker-item-buttons.component.html',
  styleUrl: './picker-item-buttons.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TippyDirective,
    ClickStopPropagationDirective,
  ],
})
export class PickerItemButtonsComponent extends PickerPartBaseComponent {
  // note: may need to do something like
  // https://stackoverflow.com/questions/38716105/angular2-render-component-without-its-wrapping-tag

  show = input.required<boolean>();

  item = input.required<PickerItem>();

  index = input.required<number>();

  constructor() { super(); }

  /** Current applicable settings like "enableEdit" etc. */
  settings = computedObj('settings', () => {
    const selected = this.item();
    const show = this.show() && !!selected;
    const sts = this.fieldState.settings();
    return {
      allowMultiValue: sts.AllowMultiValue,
      enableAddExisting: sts.EnableAddExisting,
      enableTextEntry: sts.EnableTextEntry,
      enableEdit: sts.EnableEdit && show && !selected?.noEdit,
      enableDelete: sts.EnableDelete && show && !selected?.noDelete,
      enableRemove: sts.EnableRemove && show,
      enableReselect: sts.EnableReselect,
      showAsTree: sts.PickerDisplayMode === 'tree',
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
