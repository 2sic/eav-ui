import { IFilterAngularComp } from '@ag-grid-community/angular';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams, ValueGetterParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { PubMeta, PubMetaFilterModel } from './pub-meta-filter.model';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-pub-meta-filter',
    templateUrl: './pub-meta-filter.component.html',
    styleUrls: ['./pub-meta-filter.component.scss'],
    standalone: true,
    imports: [MatRadioModule, FormsModule],
})
export class PubMetaFilterComponent implements IFilterAngularComp {
  published = '';
  metadata = '';
  hasMetadata = '';

  private filterParams: IFilterParams;

  agInit(params: IFilterParams) {
    this.filterParams = params;
  }

  isFilterActive(): boolean {
    return this.published !== '' || this.metadata !== '' || this.hasMetadata !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    let publishedPassed = false;
    let metadataPassed = false;
    let hasMetadataPassed = false;

    const valueGetterParams: ValueGetterParams = {
      api: this.filterParams.api,
      colDef: this.filterParams.colDef,
      column: this.filterParams.column,
      columnApi: this.filterParams.columnApi,
      context: this.filterParams.context,
      data: params.node.data,
      getValue: (field) => params.node.data[field],
      node: params.node,
    };
    const value: PubMeta = this.filterParams.valueGetter(valueGetterParams);
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
    if (this.hasMetadata !== '') {
      if (value.hasMetadata === null || value.hasMetadata === undefined) {
        hasMetadataPassed = false;
      } else {
        hasMetadataPassed = value.hasMetadata.toString() === this.hasMetadata;
      }
    } else {
      hasMetadataPassed = true;
    }
    return publishedPassed && metadataPassed && hasMetadataPassed;
  }

  getModel(): PubMetaFilterModel {
    if (!this.isFilterActive()) { return; }

    const model: PubMetaFilterModel = {
      filterType: 'pub-meta',
      published: this.published,
      metadata: this.metadata,
      hasMetadata: this.hasMetadata,
    };
    return model;
  }

  setModel(model: PubMetaFilterModel) {
    this.published = model ? model.published : '';
    this.metadata = model ? model.metadata : '';
    this.hasMetadata = model ? model.hasMetadata : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams) {
  }

  filterChanged() {
    this.filterParams.filterChangedCallback();
  }
}
