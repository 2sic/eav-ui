import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';

import { PubMetaFilterModel, PubMeta } from './pub-meta-filter.model';

@Component({
  selector: 'app-pub-meta-filter',
  templateUrl: './pub-meta-filter.component.html',
  styleUrls: ['./pub-meta-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PubMetaFilterComponent implements IFilterAngularComp {
  published = '';
  metadata = '';

  private params: IFilterParams;

  agInit(params: IFilterParams) {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.published !== '' || this.metadata !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    let publishedPassed = false;
    let metadataPassed = false;
    const value: PubMeta = this.params.valueGetter(params.node);
    if (this.published !== '') {
      if (value.published === null || value.published === undefined) {
        publishedPassed = false;
      } else {
        publishedPassed = value.published.toString() === this.published;
      }
    } else {
      publishedPassed = true;
    }
    if (this.metadata !== '') {
      if (value.metadata === null || value.metadata === undefined) {
        metadataPassed = false;
      } else {
        metadataPassed = value.metadata.toString() === this.metadata;
      }
    } else {
      metadataPassed = true;
    }
    return publishedPassed && metadataPassed;
  }

  getModel(): PubMetaFilterModel {
    if (!this.isFilterActive()) { return; }
    return {
      filterType: 'pub-meta',
      published: this.published,
      metadata: this.metadata,
    };
  }

  setModel(model: PubMetaFilterModel) {
    this.published = model ? model.published : '';
    this.metadata = model ? model.metadata : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams) {
  }

  filterChanged() {
    this.params.filterChangedCallback();
  }
}
