import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { SiteLanguage } from '../../models/site-language.model';
import { SiteLanguagesStatusParams } from './site-languages-status.models';

@Component({
  selector: 'app-site-languages-status',
  templateUrl: './site-languages-status.component.html',
  styleUrls: ['./site-languages-status.component.scss'],
})
export class SiteLanguagesStatusComponent implements ICellRendererAngularComp {
  value: boolean;
  private params: SiteLanguagesStatusParams;

  agInit(params: SiteLanguagesStatusParams) {
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
