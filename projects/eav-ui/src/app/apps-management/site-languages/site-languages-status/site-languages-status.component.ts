import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import { SiteLanguage } from '../../models/site-language.model';
import { SiteLanguagesStatusParams } from './site-languages-status.models';

@Component({
  selector: 'app-site-languages-status',
  templateUrl: './site-languages-status.component.html',
  styleUrls: ['./site-languages-status.component.scss'],
})
export class SiteLanguagesStatusComponent implements ICellRendererAngularComp {
  value: boolean;

  private params: ICellRendererParams & SiteLanguagesStatusParams;

  agInit(params: ICellRendererParams & SiteLanguagesStatusParams): void {
    this.params = params;
    this.value = this.params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  toggleLanguage(event: MatSlideToggleChange): void {
    const language: SiteLanguage = this.params.data;
    this.params.onToggleLanguage(language, event.checked);
  }
}
