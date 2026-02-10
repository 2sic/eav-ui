import { Injectable, Signal } from '@angular/core';
import { classLogEnabled } from '../logging';
import { computedObj } from '../signals/signal.utilities';
import { HttpServiceBase } from './http-service-base';

const logSpecs = {
  all: false,
  get: true,
  getResource: true,
};

interface SysDataSpecs {
  /** optional signal to trigger refresh */
  refresh?: Signal<unknown>;
  /** The name of the data source */
  source: string;
  /** parameters in the query for the data source */
  params?: Record<string, unknown> | Signal<Record<string, unknown>>;
  /** fields to select in the query */
  fields?: string | Signal<string>;
  // entitiesFilter?: string[];

  /** Optional parameter to disable camel casing - WIP, in future we plan to always use camel casing */
  noCamel?: boolean;

  /** Optional parameter to specify which stream to select from the result - WIP */
  streams?: string;
}

interface ResultWIP<TData> {
  /** non-camel case */
  Default: TData[];

  /** camel case - recommended */
  default: TData[];
}

/**
 * Special service to get system data from the backend.
 *
 * @export
 * @class SysDataService
 * @extends {HttpServiceBase}
 */
@Injectable()
export class SysDataService extends HttpServiceBase {

  log = classLogEnabled({SysDataService}, logSpecs);

  /** 
   * Get data from the backend as a signal.
   * Internally it uses an httpResource, but since we flatten it (remove the 'Default' wrapper)
   * it arrives as a computed signal here.
   * @returns 
   */
  get<TData>(specs : SysDataSpecs) {
    const l = this.log.fnIf('get', specs as unknown as Record<string, unknown>);

    // Get the real underlying httpResource
    const resource = this.getResource<TData>(specs);

    // Flatten the data to remove the 'Default' wrapper
    const flattened = computedObj(specs.source, () => {
      l.a(`computing flattened data for source: ${specs.source}`);
      if (resource.isLoading()) {
        l.a('Resource is loading, returning empty array');
        return [];
      }
      if (resource.error()) {
        l.a(`Error loading SysData source '${specs.source}': ${resource.error()}`);
        return [];
      }

      const allData = resource.value();
      const data = allData?.default ?? allData?.Default;
      l.a('data', { allData, data });

      return data ?? [];
    });
    return flattened;
  }

  /**
   * 
   * @returns 
   */
  getResource<TData>({ refresh, source, params, fields, noCamel, streams } : SysDataSpecs) {
    const l = this.log.fnIf('getResource', { source, params, fields /*, entitiesFilter */ });
    return this.newHttpResource<ResultWIP<TData>>(() => {
      const paramChanged = refresh?.();

      // Resolve the params
      const paramsTemp = typeof params === 'function' ? params() : params;
      params = paramsTemp ?? {};
      const fieldsTemp = typeof fields === 'function' ? fields() : fields;
      fields = fieldsTemp;

      l.a(`creating httpResource for source: ${source}, '${paramChanged}'`);
      // console.log(`creating httpResource for source: ${source}`);
      return {
        url: 'app/auto/query/System.SysData/' + (streams ?? 'Default'),
        params: {
          appId: this.context.appId,
          SysDataSource: source,
          ...(fields ? { '$select': fields } : {}),
          ...(noCamel ? {} : { '$casing': 'camel' }),
          ...params,
        }
      };
    });
  }

}
