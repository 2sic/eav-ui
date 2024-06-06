import { NgModule } from '@angular/core';
import { MonacoEditorComponent } from './monaco-editor.component';

@NgModule({
    imports: [
        MonacoEditorComponent,
    ],
    exports: [
        MonacoEditorComponent,
    ],
})
export class MonacoEditorModule { }
