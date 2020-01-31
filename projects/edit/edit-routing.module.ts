import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenMultiItemDialogComponent } from './eav-item-dialog/dialogs/open-multi-item-dialog/open-multi-item-dialog.component';

const editRoutes: Routes = [
  { path: '', component: OpenMultiItemDialogComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(editRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class EditRoutingModule { }
