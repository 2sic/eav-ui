import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SiteLanguagesStatusComponent } from '../ag-grid-components/site-languages-status/site-languages-status.component';
import { SiteLanguagesStatusParams } from '../ag-grid-components/site-languages-status/site-languages-status.models';
import { SiteLanguage } from '../models/site-language.model';
import { ZoneService } from '../services/zone.service';

@Component({
  selector: 'app-site-languages',
  templateUrl: './site-languages.component.html',
  styleUrls: ['./site-languages.component.scss'],
})
export class SiteLanguagesComponent implements OnInit, OnDestroy {
  languages$ = new BehaviorSubject<SiteLanguage[]>(null);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      booleanFilterComponent: BooleanFilterComponent,
      siteLanguagesStatusComponent: SiteLanguagesStatusComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as SiteLanguage).Code,
        cellRendererParams: {
          tooltipGetter: (language: SiteLanguage) => `ID: ${language.Code}`,
        } as IdFieldParams,
      },
      {
        field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight no-outline', sortable: true,
        sort: 'asc', filter: 'agTextColumnFilter', onCellClicked: (event) => this.toggleLanguage(event.data as SiteLanguage),
        valueGetter: (params) => (params.data as SiteLanguage).Culture,
      },
      {
        field: 'Status', width: 72, headerClass: 'dense', cellClass: 'no-padding no-outline',
        cellRenderer: 'siteLanguagesStatusComponent', sortable: true, filter: 'booleanFilterComponent',
        valueGetter: (params) => (params.data as SiteLanguage).IsEnabled,
        cellRendererParams: {
          onEnabledToggle: (language) => this.toggleLanguage(language),
        } as SiteLanguagesStatusParams,
      },
    ],
  };

  constructor(private zoneService: ZoneService) { }

  ngOnInit() {
    this.fetchLanguages();
  }

  ngOnDestroy() {
    this.languages$.complete();
  }

  private toggleLanguage(language: SiteLanguage) {
    this.zoneService.toggleLanguage(language.Code, !language.IsEnabled).subscribe(() => {
      this.fetchLanguages();
    });
  }

  private fetchLanguages() {
    this.zoneService.getLanguages().subscribe(languages => {
      this.languages$.next(languages);
    });
  }
}
