import { DataSourceInstance } from '../models/data-source-instance.model';
import { JsPlumbEndpoint } from './jsplumb.models';

export function findDefByType(dataSources: DataSourceInstance [], partAssemblyAndType: string): DataSourceInstance | undefined {
  return dataSources.find(ds => ds.PartAssemblyAndType === partAssemblyAndType)
}

export function getEndpointLabel(endpoint: JsPlumbEndpoint) : string {
  return endpoint.getOverlay('endpointLabel').label
}