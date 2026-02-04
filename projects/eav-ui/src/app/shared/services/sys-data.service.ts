import { Injectable, Signal } from '@angular/core';
import { classLogEnabled } from '../logging';
import { computedObj } from '../signals/signal.utilities';
import { HttpServiceBase } from './http-service-base';

const logSpecs = {
  all: false,
  get: true,
  getResource: true,
};

interface SysDataParams {
  /** optional signal to trigger refresh */
  refresh?: Signal<unknown>;
  /** The name of the data source */
  source: string;
  /** parameters in the query for the data source */
  params?: Record<string, unknown>;
  /** fields to select in the query */
  fields?: string;
  // entitiesFilter?: string[];
}

interface ResultWIP<TData> {
  Default: TData[]
}

@Injectable()
export class SysDataService extends HttpServiceBase {

  log = classLogEnabled({SysDataService}, logSpecs);

  // constructor(private http: HttpClient, private context: Context) { }

  get<TData>({ refresh, source, params, fields } : SysDataParams) {
    const l = this.log.fnIf('get', { source, params, fields });
    const resource = this.getResource<TData>({ refresh, source, params, fields });
    const flattened = computedObj(source, () => {
      l.a(`computing flattened data for source: ${source}`);
      if (resource.isLoading()) {
        l.a('Resource is loading, returning empty array');
        return [];
      }
      if (resource.error()) {
        l.a(`Error loading SysData source '${source}': ${resource.error()}`);
        return [];
      }
      const data = resource.value()?.Default;
      l.a('data', { value: resource.value(), data });

      return data ?? [];
    });
    return flattened;
  }

  /**
   * 
   * @returns 
   */
  getResource<TData>({ refresh, source, params, fields } : SysDataParams) {
    const l = this.log.fnIf('getResource', { source, params, fields /*, entitiesFilter */ });
    return this.newHttpResource<ResultWIP<TData>>(() => {
      refresh?.();
      return {
        url: 'app/auto/query/System.SysData/Default',
        params: {
          appId: this.context.appId,
          SysDataSource: source,
          ...(fields ? { '$select': fields } : {}),
          ...(params ?? {}),
        }
      };
    });
  }

}
