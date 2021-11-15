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

  // filters can be published, metadata, string, number and boolean
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

  const filterKeys = Object.keys(parsed);
  for (const key of filterKeys) {
    if (key === 'IsPublished' || key === 'IsMetadata') { continue; }

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
