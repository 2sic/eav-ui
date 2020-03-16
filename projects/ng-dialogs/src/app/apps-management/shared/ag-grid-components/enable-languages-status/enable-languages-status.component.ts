import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { EnableLanguage } from '../../models/enable-language.model';
import { EnableLanguagesStatusParams } from '../../models/enable-languages-status-params.model';

@Component({
  selector: 'app-enable-languages-status',
  templateUrl: './enable-languages-status.component.html',
  styleUrls: ['./enable-languages-status.component.scss']
})
export class EnableLanguagesStatusComponent implements ICellRendererAngularComp {
  private params: EnableLanguagesStatusParams;
  value: boolean;

  agInit(params: EnableLanguagesStatusParams) {
    this.params = params;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  toggleLanguage() {
    const language: EnableLanguage = this.params.data;
    this.params.onEnabledToggle(language);
  }
}
