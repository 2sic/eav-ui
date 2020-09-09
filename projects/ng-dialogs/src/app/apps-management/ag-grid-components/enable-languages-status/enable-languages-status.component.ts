import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { EnableLanguage } from '../../models/enable-language.model';
import { EnableLanguagesStatusParams } from './enable-languages-status.models';

@Component({
  selector: 'app-enable-languages-status',
  templateUrl: './enable-languages-status.component.html',
  styleUrls: ['./enable-languages-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    const language: EnableLanguage = this.params.data;
    this.params.onEnabledToggle(language);
  }
}
