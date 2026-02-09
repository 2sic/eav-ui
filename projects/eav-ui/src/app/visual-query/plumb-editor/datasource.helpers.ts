import { DataSource } from '../models/data-sources.model';
import { JsPlumbEndpoint } from './jsplumb.models';

export function findDefByType(dataSources: DataSource [], partAssemblyAndType: string): DataSource | undefined {
  return dataSources.find(ds => ds.PartAssemblyAndType === partAssemblyAndType)
}

export function getEndpointLabel(endpoint: JsPlumbEndpoint) : string {
  return endpoint.getOverlay('endpointLabel').label
}