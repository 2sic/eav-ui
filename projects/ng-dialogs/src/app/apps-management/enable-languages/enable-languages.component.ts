import { AllCommunityModules, CellClickedEvent, GridOptions, ValueGetterParams } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { EnableLanguagesStatusComponent } from '../ag-grid-components/enable-languages-status/enable-languages-status.component';
import { EnableLanguagesStatusParams } from '../ag-grid-components/enable-languages-status/enable-languages-status.models';
import { EnableLanguage } from '../models/enable-language.model';
import { EnableLanguagesService } from '../services/enable-languages.service';

@Component({
  selector: 'app-enable-languages',
  templateUrl: './enable-languages.component.html',
  styleUrls: ['./enable-languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnableLanguagesComponent implements OnInit, OnDestroy {
  languages$ = new BehaviorSubject<EnableLanguage[]>(null);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      booleanFilterComponent: BooleanFilterComponent,
      enableLanguagesStatusComponent: EnableLanguagesStatusComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Code', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
      },
      {
        headerName: 'Name', field: 'Culture', flex: 2, minWidth: 250, cellClass: 'primary-action highlight no-outline', sortable: true,
        filter: 'agTextColumnFilter', onCellClicked: this.handleNameClicked.bind(this),
      },
      {
        headerName: 'Status', field: 'IsEnabled', width: 72, headerClass: 'dense', cellClass: 'no-padding no-outline',
        cellRenderer: 'enableLanguagesStatusComponent', sortable: true, filter: 'booleanFilterComponent',
        cellRendererParams: {
          onEnabledToggle: this.toggleLanguage.bind(this),
        } as EnableLanguagesStatusParams,
      },
    ],
  };

  constructor(private languagesService: EnableLanguagesService) { }

  ngOnInit() {
    this.fetchLanguages();
  }

  ngOnDestroy() {
    this.languages$.complete();
  }

  private idValueGetter(params: ValueGetterParams) {
    const language: EnableLanguage = params.data;
    return `ID: ${language.Code}`;
  }

  private handleNameClicked(params: CellClickedEvent) {
    const language: EnableLanguage = params.data;
    this.toggleLanguage(language);
  }

  private toggleLanguage(language: EnableLanguage) {
    this.languagesService.save(language.Code, !language.IsEnabled).subscribe(() => {
      this.fetchLanguages();
    });
  }

  private fetchLanguages() {
    this.languagesService.getAll().subscribe(languages => {
      this.languages$.next(languages);
    });
  }
}
