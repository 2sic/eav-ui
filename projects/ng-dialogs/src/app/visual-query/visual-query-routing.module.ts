import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit } from '../../../../edit/edit.matcher';
import { GoToDevRest } from '../dev-rest';
import { VisualQueryComponent } from './visual-query.component';

const routes: Routes = [
  {
    path: '', component: VisualQueryComponent, children: [
      GoToDevRest.route,
      {
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule),
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
