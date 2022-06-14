import { AgGridModule } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleNames, ModuleRegistry } from '@ag-grid-community/core';
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
    if (!ModuleRegistry.isRegistered(ModuleNames.ClientSideRowModelModule)) {
      ModuleRegistry.register(ClientSideRowModelModule);
    }
  }
}
