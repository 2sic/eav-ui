import { AllCommunityModules, CellClickedEvent, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SiteLanguagesStatusComponent } from '../ag-grid-components/enable-languages-status/enable-languages-status.component';
import { SiteLanguagesStatusParams } from '../ag-grid-components/enable-languages-status/enable-languages-status.models';
import { SiteLanguage } from '../models/site-language.model';
import { ZoneService } from '../services/zone.service';

@Component({
  selector: 'app-site-languages',
  templateUrl: './enable-languages.component.html',
  styleUrls: ['./enable-languages.component.scss'],
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
        headerName: 'ID', field: 'Code', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        cellRendererParams: {
          tooltipGetter: (language: SiteLanguage) => `ID: ${language.Code}`,
        } as IdFieldParams,
      },
      {
        headerName: 'Name', field: 'Culture', flex: 2, minWidth: 250, cellClass: 'primary-action highlight no-outline', sortable: true,
        sort: 'asc', filter: 'agTextColumnFilter', onCellClicked: this.handleNameClicked.bind(this),
      },
      {
        headerName: 'Status', field: 'IsEnabled', width: 72, headerClass: 'dense', cellClass: 'no-padding no-outline',
        cellRenderer: 'siteLanguagesStatusComponent', sortable: true, filter: 'booleanFilterComponent',
        cellRendererParams: {
          onEnabledToggle: this.toggleLanguage.bind(this),
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

  private handleNameClicked(params: CellClickedEvent) {
    const language: SiteLanguage = params.data;
    this.toggleLanguage(language);
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
