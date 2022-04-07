import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, Observable, of, share, startWith, Subject, switchMap } from 'rxjs';
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
  languages$: Observable<SiteLanguage[]>;
  modules = AllCommunityModules;
  gridOptions = this.buildGridOptions();

  private refreshLanguages$ = new Subject<void>();

  constructor(private zoneService: ZoneService) { }

  ngOnInit(): void {
    this.languages$ = this.refreshLanguages$.pipe(
      startWith(undefined),
      switchMap(() => this.zoneService.getLanguages().pipe(catchError(() => of(undefined)))),
      share(),
    );
  }

  ngOnDestroy(): void {
    this.refreshLanguages$.complete();
  }

  private toggleLanguage(language: SiteLanguage): void {
    this.zoneService.toggleLanguage(language.Code, !language.IsEnabled).subscribe({
      error: () => {
        this.refreshLanguages$.next();
      },
      next: () => {
        this.refreshLanguages$.next();
      },
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => (params.data as SiteLanguage).Code,
          cellRenderer: IdFieldComponent,
          cellRendererParams: {
            tooltipGetter: (language: SiteLanguage) => `ID: ${language.Code}`,
          } as IdFieldParams,
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action highlight no-outline'.split(' '),
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          valueGetter: (params) => (params.data as SiteLanguage).Culture,
          onCellClicked: (event) => this.toggleLanguage(event.data as SiteLanguage),
        },
        {
          field: 'Status',
          width: 72,
          headerClass: 'dense',
          cellClass: 'no-padding no-outline'.split(' '),
          sortable: true,
          filter: BooleanFilterComponent,
          valueGetter: (params) => (params.data as SiteLanguage).IsEnabled,
          cellRenderer: SiteLanguagesStatusComponent,
          cellRendererParams: (() => {
            const params: SiteLanguagesStatusParams = {
              onEnabledToggle: (language) => this.toggleLanguage(language),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
