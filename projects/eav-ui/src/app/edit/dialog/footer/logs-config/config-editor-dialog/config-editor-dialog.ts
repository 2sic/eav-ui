import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component, HostBinding, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { transient } from '../../../../../../../../core/transient';
import { ClipboardService } from '../../../../..//shared/services/clipboard.service';
import { MonacoEditorComponent } from '../../../../../monaco-editor/monaco-editor.component';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
@Component({
    imports: [
        MatDialogModule,
        FormsModule,
        MonacoEditorComponent,
        MatButtonModule,
        MatDialogActions,
        MatDialogClose,
        ClipboardModule,
        MatIconModule,
        TippyDirective,
    ],
    selector: 'app-monaco-editor-dialog',
    templateUrl: './config-editor-dialog.html'
})
export class ConfigEditorDialogComponent {

  @HostBinding('className') hostClass = 'dialog-component';
  
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
    public dialog: MatDialogRef<ConfigEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedConfig = JSON.stringify(data.configData, null, 2);
  }
  
  protected clipboard = transient(ClipboardService);

  onFocused(focused: boolean): void {
    this.focused = focused;
  }
}
