import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Of } from '../../../../../../core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { classLog } from '../../../shared/logging';
import { EavWindow } from '../../../shared/models/eav-window.model';
import { UserPreferences } from '../../../shared/user/user-preferences.service';
import { DataDumpComponent } from './data-dump/data-dump.component';
import { DebugTypes } from './edit-dialog-footer.models';
import { footerPreferences } from './footer-preferences';
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
    ExtendedModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
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
  
  prefManager = inject(UserPreferences).part(footerPreferences);
  preferences = this.prefManager.data;

  toggleDialog(type: Of<typeof DebugTypes>): void {
    const s = this.preferences();
    const hideTab = s.tab === type;
    const tab = hideTab ? null :  type;
    const expanded = hideTab ? false : s.expanded;
    const size = hideTab ? 0 : expanded ? 2 : 1;
    this.prefManager.setMany({ tab, expanded, size });
  }

  toggleSize(): void {
    const expanded = !this.preferences().expanded;
    const size = expanded ? 2 : 1;
    this.prefManager.setMany({ expanded, size });
  }

  pinResource(part: string): string {
    return pinResources[(`${part}-${this.preferences().pinned}`)];
  }
}

const pinResources: Record<string, string> = {
  ['status-true']: 'pinned - will remain visible on reload',
  ['status-false']: 'not pinned - will hide on reload',
  ['icon-true']: 'keep_public',
  ['icon-false']: 'keep_off',
}
