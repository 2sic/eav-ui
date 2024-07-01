import { Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { EditRoutesSubItemsNoHistory } from '../edit/edit.routing';

export const visualQueryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./visual-query.component').then(m => m.VisualQueryComponent),
    children: [
      GoToDevRest.route,
      ...EditRoutesSubItemsNoHistory,
    ]
  },
];

