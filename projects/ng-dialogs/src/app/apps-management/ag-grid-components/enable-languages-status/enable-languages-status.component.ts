import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { SiteLanguage } from '../../models/site-language.model';
import { EnableLanguagesStatusParams } from './enable-languages-status.models';

@Component({
  selector: 'app-enable-languages-status',
  templateUrl: './enable-languages-status.component.html',
  styleUrls: ['./enable-languages-status.component.scss'],
})
export class EnableLanguagesStatusComponent implements ICellRendererAngularComp {
  value: boolean;
  private params: EnableLanguagesStatusParams;

  agInit(params: EnableLanguagesStatusParams) {
    this.params = params;
    this.value = this.params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  toggleLanguage() {
    const language: SiteLanguage = this.params.data;
    this.params.onEnabledToggle(language);
  }
}
