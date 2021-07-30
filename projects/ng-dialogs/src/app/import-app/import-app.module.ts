import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ImportAppRoutingModule } from './import-app-routing.module';
import { ImportAppComponent } from './import-app.component';
import { ImportAppService } from './services/import-app.service';

@NgModule({
  declarations: [
    ImportAppComponent,
  ],
  imports: [
    CommonModule,
    ImportAppRoutingModule,
    SharedComponentsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  providers: [
    Context,
    ImportAppService,
  ]
})
export class ImportAppModule { }
