import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualQueryComponent } from './visual-query.component';
import { edit } from '../../../../edit/edit.matcher';

const routes: Routes = [
  {
    path: '', component: VisualQueryComponent, children: [
      {
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualQueryRoutingModule { }
