import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Of } from '../../../core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { classLog } from '../../../shared/logging';
import { EavWindow } from '../../../shared/models/eav-window.model';
import { UserSettings } from '../../../shared/user/user-settings.service';
import { DataDumpComponent } from './data-dump/data-dump.component';
import { DebugTypes } from './edit-dialog-footer.models';
import { FormulaDesignerComponent } from './formula-designer/formula-designer.component';
import { LogsDumpComponent } from './logs-dump/logs-dump.component';

declare const window: EavWindow;

@Component({
  selector: 'app-edit-dialog-footer',
  templateUrl: './edit-dialog-footer.component.html',
  styleUrls: ['./edit-dialog-footer.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    NgClass,
    ExtendedModule,
    MatButtonModule,
    MatIconModule,
    DataDumpComponent,
    FormulaDesignerComponent,
    LogsDumpComponent,
    TippyDirective,
  ],
})
export class EditDialogFooterComponent {

  log = classLog({EditDialogFooterComponent});
  
  DebugTypes = DebugTypes;
  sxcVer = window.sxcVersion.substring(0, window.sxcVersion.lastIndexOf('.'));
  
  // Persisted user settings
  static readonly userSettings = {
    key: 'edit-dialog-footer',
    data: { tab: null as Of<typeof DebugTypes>, expanded: false, size: 0 }
  };
  #userSettings = inject(UserSettings).part(EditDialogFooterComponent.userSettings);
  userSettings = this.#userSettings.data;

  toggleDialog(type: Of<typeof DebugTypes>): void {
    const s = this.userSettings();
    const hideTab = s.tab === type;
    const tab = hideTab ? null :  type;
    const expanded = hideTab ? false : s.expanded;
    const size = hideTab ? 0 : expanded ? 2 : 1;
    this.#userSettings.setAll({ tab, expanded, size });
  }

  toggleSize(): void {
    const expanded = !this.userSettings().expanded;
    const size = expanded ? 2 : 1;
    this.#userSettings.setMany({ expanded, size });
  }
}
