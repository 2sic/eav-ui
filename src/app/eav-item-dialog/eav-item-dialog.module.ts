import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EavItemDialogComponent } from './eav-item-dialog.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [EavItemDialogComponent],
  exports: [EavItemDialogComponent]
})
export class EavItemDialogModule { }
