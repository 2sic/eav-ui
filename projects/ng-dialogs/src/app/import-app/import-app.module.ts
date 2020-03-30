import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImportAppRoutingModule } from './import-app-routing.module';
import { ImportAppComponent } from './import-app.component';
import { Context } from '../shared/context/context';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { ImportAppService } from '../apps-management/shared/services/import-app.service';

@NgModule({
  declarations: [
    ImportAppComponent,
  ],
  entryComponents: [
    ImportAppComponent,
  ],
  imports: [
    CommonModule,
    ImportAppRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    Context,
    ImportAppService,
  ]
})
export class ImportAppModule { }
