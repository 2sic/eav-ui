import { Component, OnInit } from '@angular/core';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { EnableLanguagesService } from '../shared/services/enable-languages.service';
import { EnableLanguage } from '../shared/models/enable-language.model';
import { EnableLanguagesStatusComponent } from '../shared/ag-grid-components/enable-languages-status/enable-languages-status.component';
import { EnableLanguagesStatusParams } from '../shared/models/enable-languages-status-params.model';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';

@Component({
  selector: 'app-enable-languages',
  templateUrl: './enable-languages.component.html',
  styleUrls: ['./enable-languages.component.scss']
})
export class EnableLanguagesComponent implements OnInit {
  languages: EnableLanguage[];

  columnDefs: ColDef[] = [
    {
      headerName: 'Code', field: 'Code', minWidth: 160, width: 100, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.handleNameClicked.bind(this)
    },
    {
      headerName: 'Culture', field: 'Culture', minWidth: 250, width: 150, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.handleNameClicked.bind(this)
    },
    {
      headerName: 'Status', field: 'IsEnabled', minWidth: 160, width: 100, cellRenderer: 'enableLanguagesStatusComponent',
      sortable: true, filter: 'booleanFilterComponent', cellRendererParams: <EnableLanguagesStatusParams>{
        onEnabledToggle: this.toggleLanguage.bind(this),
      },
    },
  ];
  frameworkComponents = {
    booleanFilterComponent: BooleanFilterComponent,
    enableLanguagesStatusComponent: EnableLanguagesStatusComponent,
  };
  modules = AllCommunityModules;

  constructor(private languagesService: EnableLanguagesService) { }

  ngOnInit() {
    this.fetchLanguages();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  private handleNameClicked(params: CellClickedEvent) {
    const language = <EnableLanguage>params.data;
    this.toggleLanguage(language);
  }

  private toggleLanguage(language: EnableLanguage) {
    this.languagesService.save(language.Code, !language.IsEnabled).subscribe(() => {
      console.log(`${language.Code} is ${!language.IsEnabled}`);
      this.fetchLanguages();
    });
  }

  private fetchLanguages() {
    this.languagesService.getAll().subscribe(languages => {
      this.languages = languages;
    });
  }
}
