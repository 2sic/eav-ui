import { ColDef, NumberFilterModel, TextFilterModel } from '@ag-grid-community/core';
import { BooleanFilterModel } from '../shared/components/boolean-filter/boolean-filter.model';
import { EntityFilterComponent } from '../shared/components/entity-filter/entity-filter.component';
import { EntityFilterModel } from '../shared/components/entity-filter/entity-filter.model';
import { AgGridFilterModel } from './models/ag-grid-filter.model';
import { PubMetaFilterModel } from './pub-meta-filter/pub-meta-filter.model';
import { JsonHelpers } from '../shared/helpers/json.helpers';

export function buildFilterModel(urlFilters: string, columnDefs: ColDef[]) {
  if (!urlFilters) { return; }

  // special decode if parameter was passed as base64 - this is necessary for strings containing the "+" character
  if (urlFilters.charAt(urlFilters.length - 1) === '=') {
    urlFilters = atob(urlFilters);
  }

  let filters: Record<string, any>;
  try {
    filters = JSON.parse(urlFilters);
  } catch (error) {
    console.error('Can\'t parse JSON with filters from url:', urlFilters);
  }
  if (!filters) { return; }

  // handle IsPublished and IsMetadata
  const filterModel: AgGridFilterModel = {};
  if (filters.IsPublished || filters.IsMetadata) {
    const filter: PubMetaFilterModel = {
      filterType: 'pub-meta',
      published: filters.IsPublished ?? '',
      metadata: filters.IsMetadata ?? '',
      hasMetadata: '',
    };
    filterModel.Status = filter;
  }

  // handle all other cases
  Object.entries(filters)
    .filter(([key, value]) => key !== 'IsPublished' && key !== 'IsMetadata')
    .forEach(([key, value]) => {
      const columnDef = columnDefs.find(c => c.headerName === key);
      if (columnDef?.filter === EntityFilterComponent) {
        value = JsonHelpers.tryParse(value) ?? value;
        const filter: EntityFilterModel = {
          filterType: 'entity',
          filter: typeof value === 'string' ? value : undefined,
          idFilter: typeof value === 'number' ? [value] : Array.isArray(value) ? value.filter(v => typeof v === 'number') : undefined,
        };
        filterModel[key] = filter;
        return;
      }

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
    });

  return filterModel;
}
