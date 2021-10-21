import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MonacoEditorComponent } from './monaco-editor.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    MonacoEditorComponent,
  ],
  exports: [
    MonacoEditorComponent,
  ],
})
export class MonacoEditorModule { }
