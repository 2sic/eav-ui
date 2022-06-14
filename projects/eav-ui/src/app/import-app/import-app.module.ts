import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
  ],
  providers: [
    Context,
    ImportAppService,
  ]
})
export class ImportAppModule { }
