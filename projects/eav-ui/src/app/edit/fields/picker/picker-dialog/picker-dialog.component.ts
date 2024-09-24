import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { PickerTextComponent } from '../picker-text/picker-text.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerListComponent } from '../picker-list/picker-list.component';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { computedObj } from '../../../../shared/signals/signal.utilities';

@Component({
  selector: 'app-picker-dialog',
  templateUrl: './picker-dialog.component.html',
  standalone: true,
  imports: [
    PickerListComponent,
    PickerSearchComponent,
    PickerTextComponent,
    FieldHelperTextComponent,
    FlexModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class PickerDialogComponent extends PickerPartBaseComponent {

  protected showAddNewEntityButtonInDialog = computedObj('showAddNewEntityButtonInDialog', () => {
    const settings = this.fieldState.settings();
    const showAddNew = !this.isInFreeTextMode()
      && settings.EnableCreate
      && settings.CreateTypes
      && settings.AllowMultiValue;
    return showAddNew;
  });

}
