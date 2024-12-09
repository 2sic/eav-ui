import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { PickerListComponent } from '../picker-list/picker-list.component';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerTextComponent } from '../picker-text/picker-text.component';

@Component({
    selector: 'app-picker-dialog',
    templateUrl: './picker-dialog.component.html',
    imports: [
        PickerListComponent,
        PickerSearchComponent,
        PickerTextComponent,
        FieldHelperTextComponent,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        TippyDirective,
    ]
})
export class PickerDialogComponent extends PickerPartBaseComponent {

  protected showAddNewEntityButtonInDialog = computedObj('showAddNewEntityButtonInDialog', () => {
    const features = this.features();
    const settings = this.fieldState.settings();
    const showAddNew = !this.isInFreeTextMode()
      && settings.EnableCreate
      && settings.CreateTypes
      && features.multiValue;
    return showAddNew;
  });

}
