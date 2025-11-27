import { AgGridModule } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    AgGridModule,
  ],
  exports: [
    AgGridModule,
  ],
})
export class SxcGridModule {
  constructor() {
    ModuleRegistry.register(ClientSideRowModelModule);
  }
}
