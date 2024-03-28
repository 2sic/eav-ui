import { NgModule } from '@angular/core';
import { Context } from '../shared/services/context';
import { ImportAppRoutingModule } from './import-app-routing.module';
@NgModule({
    imports: [
        ImportAppRoutingModule,
    ],
    providers: [
        Context,
    ]
})
export class ImportAppModule { }
