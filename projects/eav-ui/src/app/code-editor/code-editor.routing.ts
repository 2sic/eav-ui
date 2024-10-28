import { Routes } from '@angular/router';

export const codeEditorRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./code-editor.component').then(m => m.CodeEditorComponent),
  },
];
