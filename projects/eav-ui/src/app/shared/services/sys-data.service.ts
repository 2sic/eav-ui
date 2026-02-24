import { Injectable, Signal } from '@angular/core';
import { classLogEnabled } from '../../../../../shared/logging';
import { computedObj } from '../signals/signal.utilities';
import { HttpServiceBase } from './http-service-base';

const logSpecs = {
  all: false,
  get: true,
  getResource: true,
  getFirst: true,
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
   * Get the first item of a data source as a signal. This is useful for cases where you expect only one item, like the polymorphism info.
   * @param specs 
   * @returns 
   */
  getFirst<TData>(specs : SysDataSpecs) {
    const l = this.log.fnIf('getFirst', specs as unknown as Record<string, unknown>);
    const resource = this.get<TData>(specs);
    return computedObj(specs.source, () => {
      const data = resource();
      return data.length > 0 ? data[0] : null;
    });
  }

  /** 
   * Get data from the backend as a signal.
   * Internally it uses an httpResource, but since we flatten it (remove the 'Default' wrapper)
   * it arrives as a computed signal here.
   * @returns 
   */
  get<TData>(specs : SysDataSpecs) {
    const l = this.log.fnIf('get', specs as unknown as Record<string, unknown>);

    // Get the real underlying httpResource
    const resource = this.getMany<ResultWIP<TData>>(specs);

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
  getMany<TData>({ refresh, source, params, fields, noCamel, streams } : SysDataSpecs) {
    const l = this.log.fnIf('getResource', { source, params, fields /*, entitiesFilter */ });
    return this.newHttpResource<TData>(() => {
      const paramChanged = refresh?.();

      // Resolve the params
      // const pIsSig = typeof params === 'function';
      const paramsFinal = (typeof params === 'function' ? params() : params) ?? {};
      
      const fieldsFinal = (typeof fields === 'function' ? fields() : fields) ?? '';

      l.a(`creating httpResource for source: ${source}, '${paramChanged}'`, { params, fields, noCamel, streams });
      // console.log(`creating httpResource for source: ${source}`);

      const streamNames = streams == '*'
        ? ''
        : streams ?? 'Default';

      return {
        url: `app/auto/query/System.SysData/${streamNames}`,
        params: {
          appId: this.context.appId,
          SysDataSource: source,
          ...(fieldsFinal ? { '$select': fieldsFinal } : {}),
          ...(noCamel ? {} : { '$casing': 'camel' }),
          ...paramsFinal,
        }
      };
    });
  }

}
