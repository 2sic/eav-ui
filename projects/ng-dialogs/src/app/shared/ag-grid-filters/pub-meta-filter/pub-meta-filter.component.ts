import { Component } from '@angular/core';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';

import { PubMetaFilter, PubMeta } from './pub-meta-filter.model';

@Component({
  selector: 'app-pub-meta-filter',
  templateUrl: './pub-meta-filter.component.html',
  styleUrls: ['./pub-meta-filter.component.scss']
})
export class PubMetaFilterComponent implements IFilterAngularComp {
  published = 'all';
  metadata = 'all';

  private params: IFilterParams;

  agInit(params: IFilterParams) {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.published !== 'all' || this.metadata !== 'all';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    let publishedPassed = false;
    let metadataPassed = false;
    const value: PubMeta = this.params.valueGetter(params.node);
    if (this.published !== 'all') {
      publishedPassed = value.published.toString() === this.published;
    } else {
      publishedPassed = true;
    }
    if (this.metadata !== 'all') {
      metadataPassed = value.metadata.toString() === this.metadata;
    } else {
      metadataPassed = true;
    }
    return publishedPassed && metadataPassed;
  }

  getModel(): PubMetaFilter {
    return {
      filterType: 'pub-meta',
      published: this.published,
      metadata: this.metadata,
    };
  }

  setModel(model: PubMetaFilter) {
    this.published = model ? model.published : 'all';
    this.metadata = model ? model.metadata : 'all';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams) {
  }

  filterChanged() {
    this.params.filterChangedCallback();
  }
}
