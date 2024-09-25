import { Component, HostBinding, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MonacoEditorComponent } from '../../../../../monaco-editor/monaco-editor.component';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
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
    MatIconModule,
    TippyDirective,
  ],
  selector: 'app-monaco-editor-dialog',
  templateUrl: './specs-editor-dialog.component.html',
})
export class SpecsEditorDialogComponent {

  @HostBinding('className') hostClass = 'dialog-component';

  logSpecs: string;
  focused = false;
  editorOptions = {
    theme: 'vs-light',
    language: 'json',
    readOnly: false,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };
  filename = 'log-specs.json';

  constructor(
    public dialogRef: MatDialogRef<SpecsEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.logSpecs = JSON.stringify(data.logSpecs, null, 2);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.logSpecs);
  }

  onValueChanged(newValue: string): void {
    this.logSpecs = newValue;
  }

  onFocused(focused: boolean): void {
    this.focused = focused;
  }
}
