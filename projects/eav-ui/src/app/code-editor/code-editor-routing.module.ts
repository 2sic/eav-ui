import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const codeEditorRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./code-editor.component').then(m => m.CodeEditorComponent),

  },
];

@NgModule({
  imports: [RouterModule.forChild(codeEditorRoutes)],
  exports: [RouterModule]
})
export class CodeEditorRoutingModule { }
