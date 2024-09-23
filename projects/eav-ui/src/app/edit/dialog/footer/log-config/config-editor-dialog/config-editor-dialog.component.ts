import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MonacoEditorComponent } from '../../../../../monaco-editor/monaco-editor.component';
import { MatButtonModule } from '@angular/material/button';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    MonacoEditorComponent,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    ClipboardModule,
    MatIconModule,
    TippyDirective,
  ],
  selector: 'app-monaco-editor-dialog',
  templateUrl: './config-editor-dialog.component.html',
})
export class ConfigEditorDialogComponent {
  selectedConfig: string;
  focused = false;
  editorOptions = {
    theme: 'vs-light',
    language: 'json',
    readOnly: true,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };
  filename = 'exported-config.json';

  constructor(
    public dialogRef: MatDialogRef<ConfigEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedConfig = JSON.stringify(data.configData, null, 2);
  }

  onFocused(focused: boolean): void {
    this.focused = focused;
  }
}
