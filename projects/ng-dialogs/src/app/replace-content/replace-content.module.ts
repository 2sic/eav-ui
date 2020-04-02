import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ReplaceContentRoutingModule } from './replace-content-routing.module';
import { ReplaceContentComponent } from './replace-content.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { Context } from '../shared/context/context';

@NgModule({
  declarations: [
    ReplaceContentComponent,
  ],
  entryComponents: [
    ReplaceContentComponent,
  ],
  imports: [
    CommonModule,
    ReplaceContentRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [
    Context,
  ]
})
export class ReplaceContentModule { }
