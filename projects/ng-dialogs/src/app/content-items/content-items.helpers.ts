import { TextFilterModel, NumberFilterModel } from '@ag-grid-community/all-modules';

import { AgGridFilterModel } from './models/ag-grid-filter.model';
import { PubMetaFilterModel } from './ag-grid-components/pub-meta-filter/pub-meta-filter.model';
import { BooleanFilterModel } from '../shared/components/boolean-filter/boolean-filter.model';

export function buildFilterModel(urlFilters: string) {
  if (!urlFilters) { return; }

  // special decode if parameter was passed as base64 - this is necessary for strings containing the "+" character
  if (urlFilters.charAt(urlFilters.length - 1) === '=') {
    urlFilters = atob(urlFilters);
  }

  let parsed: { [key: string]: any };
  try {
    parsed = JSON.parse(urlFilters);
  } catch (error) {
    console.error('Can\'t parse JSON with filters from url:', urlFilters);
  }
  if (!parsed) { return; }

  // filters can be published, metadata, string, number and boolean
  const filterModel: AgGridFilterModel = {};
  if (parsed.IsPublished || parsed.IsMetadata) {
    const filter: PubMetaFilterModel = {
      filterType: 'pub-meta',
      published: parsed.IsPublished ? parsed.IsPublished : '',
      metadata: parsed.IsMetadata ? parsed.IsMetadata : '',
    };
    filterModel.Status = filter;
  }

  const filterKeys = Object.keys(parsed);
  for (const key of filterKeys) {
    if (key === 'IsPublished' || key === 'IsMetadata') { continue; }

    const value = parsed[key];
    if (typeof value === typeof '') {
      const filter: TextFilterModel = { filterType: 'text', type: 'equals', filter: value };
      filterModel[key] = filter;
    } else if (typeof value === typeof 0) {
      const filter: NumberFilterModel = { filterType: 'number', type: 'equals', filter: value, filterTo: null };
      filterModel[key] = filter;
    } else if (typeof value === typeof true) {
      const filter: BooleanFilterModel = { filterType: 'boolean', filter: value.toString() };
      filterModel[key] = filter;
    }
  }

  return filterModel;
}
