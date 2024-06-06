import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, combineLatest, map, Observable, of, share, startWith, Subject, switchMap } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SiteLanguage } from '../models/site-language.model';
import { ZoneService } from '../services/zone.service';
import { SiteLanguagesStatusComponent } from './site-languages-status/site-languages-status.component';
import { SiteLanguagesStatusParams } from './site-languages-status/site-languages-status.models';
import { AsyncPipe } from '@angular/common';
import { MatDialogActions } from '@angular/material/dialog';
import { AgGridModule } from '@ag-grid-community/angular';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';

@Component({
  selector: 'app-site-languages',
  templateUrl: './site-languages.component.html',
  styleUrls: ['./site-languages.component.scss'],
  standalone: true,
  imports: [
    MatDialogActions,
    AsyncPipe,
    AgGridModule,
  ],
  providers: [
    ZoneService,
  ],
})
export class SiteLanguagesComponent implements OnInit, OnDestroy {
  gridOptions = this.buildGridOptions();

  private refreshLanguages$ = new Subject<void>();

  viewModel$: Observable<SiteLanguagesViewModel>;

  constructor(private zoneService: ZoneService) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  ngOnInit(): void {

    this.viewModel$ = combineLatest([
      this.refreshLanguages$.pipe(
        startWith(undefined),
        switchMap(() => this.zoneService.getLanguages().pipe(catchError(() => of(undefined)))),
        share()
      )
    ]).pipe(
      map(([languages]) => {
        return { languages };
      })
    );
  }

  ngOnDestroy(): void {
    this.refreshLanguages$.complete();
  }

  private toggleLanguage(language: SiteLanguage, enable: boolean): void {
    this.zoneService.toggleLanguage(language.Code, enable).subscribe({
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
          ...ColumnDefinitions.Id,
          field: 'Code',
          filter: 'agTextColumnFilter',
          cellRenderer: IdFieldComponent,
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
            this.toggleLanguage(language, !language.IsEnabled);
          },
        },
        {
          field: 'Status',
          width: 72,
          headerClass: 'dense',
          cellClass: 'no-padding no-outline'.split(' '),
          sortable: true,
          filter: BooleanFilterComponent,
          valueGetter: (params) => {
            const language: SiteLanguage = params.data;
            return language.IsEnabled;
          },
          cellRenderer: SiteLanguagesStatusComponent,
          cellRendererParams: (() => {
            const params: SiteLanguagesStatusParams = {
              onToggleLanguage: (language, enable) => this.toggleLanguage(language, enable),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

interface SiteLanguagesViewModel {
  languages: SiteLanguage[];
}
