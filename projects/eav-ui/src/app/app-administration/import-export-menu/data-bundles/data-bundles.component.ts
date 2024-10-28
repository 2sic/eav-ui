import { GridOptions } from '@ag-grid-community/core';
import { Component, signal } from '@angular/core';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';

@Component({
  selector: 'app-data-bundles',
  standalone: true,
  imports: [
    FeatureTextInfoComponent,
    SxcGridModule,

  ],
  templateUrl: './data-bundles.component.html',
  styleUrl: './data-bundles.component.scss'
})
export class DataBundlesComponent {

  gridOptions = this.buildGridOptions();

  dataBundles = signal([]); // get data form service



  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Key',
          field: 'Path',
          // cellRenderer: AnalyzeSettingsKeyComponent,
        },
      ],
    };
    return gridOptions;
  }

}
