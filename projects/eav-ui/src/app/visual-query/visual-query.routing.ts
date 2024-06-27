import { Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { edit } from '../edit/edit.matcher';

export const visualQueryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./visual-query.component').then(m => m.VisualQueryComponent),
    children: [
      GoToDevRest.route,
      {
        matcher: edit,
        loadChildren: () => import('../edit/edit.module').then(m => m.EditModule),
        data: { history: false },
      },
    ]
  },
];

