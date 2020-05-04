import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ImportAppRoutingModule } from './import-app-routing.module';
import { ImportAppComponent } from './import-app.component';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ImportAppService } from './services/import-app.service';

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
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  providers: [
    Context,
    ImportAppService,
  ]
})
export class ImportAppModule { }
