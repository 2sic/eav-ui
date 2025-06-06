import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { Component, signal } from '@angular/core';
import { MatDialogActions } from '@angular/material/dialog';
import { transient } from '../../../../../core';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { SiteLanguage } from '../models/site-language.model';
import { ZoneService } from '../services/zone.service';
import { SiteLanguagesStatusComponent } from './site-languages-status/site-languages-status.component';
import { SiteLanguagesStatusParams } from './site-languages-status/site-languages-status.models';

@Component({
    selector: 'app-site-languages',
    templateUrl: './site-languages.component.html',
    imports: [
        MatDialogActions,
        SxcGridModule,
    ]
})
export class SiteLanguagesComponent {
  gridOptions = this.#buildGridOptions();

  #zoneSvc = transient(ZoneService);
  constructor() {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  #refreshLanguagesSig = signal(0);


   languages = this.#zoneSvc.getLanguageLive(this.#refreshLanguagesSig, undefined).value;

  #toggleLanguage(language: SiteLanguage, enable: boolean): void {
    this.#zoneSvc.toggleLanguage(language.Code, enable).subscribe(d => { // wait until the language change
      this.#refreshLanguagesSig.set(this.#refreshLanguagesSig() + 1);
    })

  }

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          field: 'Code',
          filter: 'agTextColumnFilter',
          cellRendererParams: (() => {
            const params: IdFieldParams<SiteLanguage> = {
              tooltipGetter: (language: SiteLanguage) => `ID: ${language.Code}`,
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Name',
          field: 'Culture',
          sort: 'asc',
          onCellClicked: (params) => {
            const language: SiteLanguage = params.data;
            this.#toggleLanguage(language, !language.IsEnabled);
          },
        },
        {
          field: 'Status',
          width: 72,
          headerClass: 'dense',
          cellClass: 'no-padding no-outline'.split(' '),
          sortable: true,
          filter: BooleanFilterComponent,
          valueGetter: (p: { data: SiteLanguage }) => p.data.IsEnabled,
          cellRenderer: SiteLanguagesStatusComponent,
          cellRendererParams: (() => {
            const params: SiteLanguagesStatusParams = {
              onToggleLanguage: (language, enable) => this.#toggleLanguage(language, enable),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
