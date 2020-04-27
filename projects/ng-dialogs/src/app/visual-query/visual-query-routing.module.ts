import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualQueryComponent } from './visual-query.component';

const routes: Routes = [
  { path: '', component: VisualQueryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualQueryRoutingModule { }
