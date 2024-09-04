import { Component, EventEmitter, inject, Output } from '@angular/core';
import { EavWindow } from '../../../shared/models/eav-window.model';
import { DebugType, DebugTypes } from './edit-dialog-footer.models';
import { LogsDumpComponent } from './logs-dump/logs-dump.component';
import { FormulaDesignerComponent } from './formula-designer/formula-designer.component';
import { DataDumpComponent } from './data-dump/data-dump.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { UserSettings } from '../../../shared/user/user-settings.service';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = true;
const nameOfThis = 'EditDialogFooterComponent';

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

  log = new EavLogger(nameOfThis, logThis);
  
  DebugTypes = DebugTypes;
  sxcVer = window.sxcVersion.substring(0, window.sxcVersion.lastIndexOf('.'));
  
  // Persisted user settings
  static readonly userSettingsKey = 'edit-dialog-footer';
  static readonly userSettingsDefault = { tab: null as DebugType, expanded: false, size: 0 };
  #userSettings = inject(UserSettings).partLocal(EditDialogFooterComponent.userSettingsKey, EditDialogFooterComponent.userSettingsDefault);
  userSettings = this.#userSettings.data;

  toggleDialog(type: DebugType): void {
    const s = this.userSettings();
    const tab = s.tab !== type ? type : null;
    const expanded = tab == null ? false : s.expanded;
    const size = tab == null ? 0 : expanded ? 2 : 1;
    this.#userSettings.setAll({ tab, expanded, size });
  }

  toggleSize(): void {
    const expanded = !this.userSettings().expanded;
    const size = expanded ? 2 : 1;
    this.#userSettings.setMany({ expanded, size });
  }
}
