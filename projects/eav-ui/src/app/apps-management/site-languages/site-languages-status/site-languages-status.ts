import { Component } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';
import { SiteLanguage } from '../../models/site-language.model';
import { SiteLanguagesStatusParams } from './site-languages-status.models';

@Component({
  selector: 'app-site-languages-status',
  templateUrl: './site-languages-status.html',
  styleUrls: ['./site-languages-status.scss'],
  imports: [MatSlideToggleModule]
})
export class SiteLanguagesStatusComponent
  extends AgGridCellRendererBaseComponent<SiteLanguage, boolean, SiteLanguagesStatusParams> {

  toggleLanguage(event: MatSlideToggleChange): void {
    this.params.onToggleLanguage(this.data, event.checked);
  }
}