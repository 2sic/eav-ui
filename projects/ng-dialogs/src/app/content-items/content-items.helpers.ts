import { NumberFilterModel, TextFilterModel } from '@ag-grid-community/all-modules';
import { BooleanFilterModel } from '../shared/components/boolean-filter/boolean-filter.model';
import { PubMetaFilterModel } from './ag-grid-components/pub-meta-filter/pub-meta-filter.model';
import { AgGridFilterModel } from './models/ag-grid-filter.model';

export function buildFilterModel(urlFilters: string) {
  if (!urlFilters) { return; }

  // special decode if parameter was passed as base64 - this is necessary for strings containing the "+" character
  if (urlFilters.charAt(urlFilters.length - 1) === '=') {
    urlFilters = atob(urlFilters);
  }

  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(urlFilters);
  } catch (error) {
    console.error('Can\'t parse JSON with filters from url:', urlFilters);
  }
  if (!parsed) { return; }

  // Info: filters can be IsPublished, IsMetadata, string, number and boolean
  // 1. First handle IsPublished and IsMetadata
  const filterModel: AgGridFilterModel = {};
  if (parsed.IsPublished || parsed.IsMetadata) {
    const filter: PubMetaFilterModel = {
      filterType: 'pub-meta',
      published: parsed.IsPublished ? parsed.IsPublished : '',
      metadata: parsed.IsMetadata ? parsed.IsMetadata : '',
      hasMetadata: '',
    };
    filterModel.Status = filter;
  }

  // 2. Now handle all other cases
  const filterKeys = Object.keys(parsed);
  for (const key of filterKeys) {
    // Skip IsPublished/IsMetadata, as they were already handled before
    if (key === 'IsPublished' || key === 'IsMetadata') { continue; }

    // TODO:
    // Support multiple values: It should be possible to have "Title: ['Daniel', 'Petar']" resulting in an OR on this column
    // Support entity-id on item-columns, like "Authors: 42" instead of a title-search
    const value = parsed[key];
    if (typeof value === 'string') {
      const filter: TextFilterModel = { filterType: 'text', type: 'equals', filter: value };
      filterModel[key] = filter;
    } else if (typeof value === 'number') {
      const filter: NumberFilterModel = { filterType: 'number', type: 'equals', filter: value, filterTo: null };
      filterModel[key] = filter;
    } else if (typeof value === 'boolean') {
      const filter: BooleanFilterModel = { filterType: 'boolean', filter: value.toString() };
      filterModel[key] = filter;
    }
  }

  return filterModel;
}
