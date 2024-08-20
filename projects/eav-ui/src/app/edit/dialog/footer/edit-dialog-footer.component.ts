import { Component, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { EavWindow } from '../../../shared/models/eav-window.model';
import { EntityFormBuilderComponent } from '../../entity-form/entity-form-builder/form-builder.component';
import { DebugType, DebugTypes } from './edit-dialog-footer.models';
import { LogsDumpComponent } from './logs-dump/logs-dump.component';
import { FormulaDesignerComponent } from './formula-designer/formula-designer.component';
import { DataDumpComponent } from './data-dump/data-dump.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

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
  ],
})
export class EditDialogFooterComponent {
  @Output() private debugInfoOpened = new EventEmitter<boolean>();

  DebugTypes = DebugTypes;
  activeDebug: DebugType;
  sxcVer = window.sxcVersion.substring(0, window.sxcVersion.lastIndexOf('.'));

  toggleDialog(type: DebugType): void {
    this.activeDebug = type !== this.activeDebug ? type : null;
    this.debugInfoOpened.emit(this.activeDebug != null);
  }
}
