import { Component, OnInit, OnDestroy } from '@angular/core';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { EnableLanguagesService } from '../../services/enable-languages.service';
import { EnableLanguage } from '../../models/enable-language.model';
import { EnableLanguagesStatusComponent } from '../../ag-grid-components/enable-languages-status/enable-languages-status.component';
import { EnableLanguagesStatusParams } from '../../models/enable-languages-status-params.model';

@Component({
  selector: 'app-enable-languages',
  templateUrl: './enable-languages.component.html',
  styleUrls: ['./enable-languages.component.scss']
})
export class EnableLanguagesComponent implements OnInit, OnDestroy {
  languages: EnableLanguage[];

  columnDefs: ColDef[] = [
    { headerName: 'Code', field: 'Code', cellClass: 'clickable', onCellClicked: this.handleNameClicked.bind(this), width: 100 },
    { headerName: 'Culture', field: 'Culture', cellClass: 'clickable', onCellClicked: this.handleNameClicked.bind(this) },
    {
      headerName: 'Status', field: 'IsEnabled', width: 100, cellRenderer: 'enableLanguagesStatusComponent',
      cellRendererParams: <EnableLanguagesStatusParams>{
        onEnabledToggle: this.toggleLanguage.bind(this),
      }
    },
  ];
  frameworkComponents = {
    enableLanguagesStatusComponent: EnableLanguagesStatusComponent
  };
  modules = AllCommunityModules;

  constructor(
    private languagesService: EnableLanguagesService,
  ) { }

  ngOnInit() {
    this.fetchLanguages();
  }

  ngOnDestroy() {
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
    this.languagesService.getAll().subscribe((languages: EnableLanguage[]) => {
      this.languages = languages;
    });
  }
}
