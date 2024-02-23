import { NgModule } from '@angular/core';
import { Context } from '../shared/services/context';
import { ContentImportRoutingModule } from './content-import-routing.module';
@NgModule({
    imports: [
      ContentImportRoutingModule,
    ],
    providers: [
        Context,
    ]
})
export class ContentImportModule { }
