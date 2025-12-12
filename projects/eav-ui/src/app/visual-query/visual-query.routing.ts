import { Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { EditRoutesNoHistory } from '../edit/edit.routing';

export const visualQueryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./visual-query').then(m => m.VisualQueryComponent),
    children: [
      GoToDevRest.route,
      ...EditRoutesNoHistory,
    ]
  },
];

