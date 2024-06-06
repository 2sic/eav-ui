import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeEditorComponent } from './code-editor.component';

const routes: Routes = [
  {
    path: '',
    // component: CodeEditorComponent,
    loadComponent: () => import('./code-editor.component').then(m => m.CodeEditorComponent),
    // loadComponent: () => import('./code-editor.module').then(m => m.CodeEditorModule),

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeEditorRoutingModule { }
