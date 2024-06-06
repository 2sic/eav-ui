import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { edit } from '../edit/edit.matcher';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualQueryRoutingModule { }
