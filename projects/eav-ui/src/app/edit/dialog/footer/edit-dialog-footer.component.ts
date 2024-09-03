import { Component, EventEmitter, Output, signal } from '@angular/core';
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
  @Output() private resize = new EventEmitter<number>();

  DebugTypes = DebugTypes;
  tab = signal<DebugType>(null);
  sxcVer = window.sxcVersion.substring(0, window.sxcVersion.lastIndexOf('.'));

  expanded = signal(false);

  toggleDialog(type: DebugType): void {
    this.tab.update(before => before !== type ? type : null);
    const tab = this.tab();
    if (tab == null) this.expanded.set(false);
    this.resize.emit(tab == null ? 0 : this.expanded() ? 2 : 1);
  }

  toggleSize(): void {
    this.expanded.update(x => !x);
    this.resize.emit(this.expanded() ? 2 : 1);
  }
}
