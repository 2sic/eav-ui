import { eavConstants } from '../../shared/constants/eav.constants';
import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineDataSource, PipelineModel } from '../models';
import { ConnectionsManager } from './connections-manager';
import { findDefByType, getEndpointLabel } from './datasource.helpers';
import { EndpointDefinitionsService } from './endpoint-definitions';
import { JsPlumbEndpoint, JsPlumbInstance } from './jsplumb.models';
import { domIdOfGuid } from './plumber-constants';

const logSpecs = {
  all: false,
  addEndpoint: false,
  reOrientAllLabels: true,
  fields: ['TestIn2'],
}

const endPointsWhereWeRotate = 3;
const maxLabelLengthToRotate = 30;

export class EndpointsManager {
  log = classLogEnabled({EndpointsManager}, logSpecs);

  constructor(
    private instance: JsPlumbInstance, 
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[],
    private endpointDefs: EndpointDefinitionsService,
    private connections: ConnectionsManager,
  ) { }

  
  addEndpoint(domDataSource: HTMLElement, endpointName: string, isIn: boolean, queryDs: PipelineDataSource, count: number = 0) {
    const l = this.log.fnIfInList('addEndpoint', 'fields', endpointName, { endpointName, isIn, queryDs });
    const dsDefinition = findDefByType(this.dataSources, queryDs.PartAssemblyAndType);
    const connectionList = isIn
      ? dsDefinition.In
      : dsDefinition.Out;
    const hasDynamic = connectionList?.some(name => this.endpointDefs.getInfo(name, false));
    // const count = connectionList?.length ?? -1;
    const endpointInfo = this.endpointDefs.getInfo(endpointName, hasDynamic);

    l.a(`endpointInfo ${count}`, { dataSource: dsDefinition, connectionList, hasDynamic, count, endpointInfo });

    // if (endpointName === "DEBUG") debugger;

    let style: string;
    if (hasDynamic)
      style = 'dynamic';
    else if (!endpointInfo.required)
      style = '';
    else {
      const wireExists = this.pipelineModel.Pipeline.StreamWiring?.some(wire => {
        const targetElementId = domIdOfGuid(wire.To);
        const targetEndpointName = wire.In;

        return targetElementId === domDataSource.id && targetEndpointName === endpointInfo.name;
      });
      style = wireExists ? '' : 'required';
    }

    const uuid = domDataSource.id + (isIn ? '_in_' : '_out_') + endpointInfo.name;
    // const angled = count > endPointsWhereWeRotate;
    const model = isIn
      ? this.endpointDefs.buildTargetDef(queryDs.EntityGuid, style)
      : this.endpointDefs.buildSourceDef(queryDs.EntityGuid, style);
    // Endpoints on Out-DataSource must be always enabled
    const params = {
      uuid,
      enabled: this.pipelineModel.Pipeline.AllowEdit
        || queryDs.EntityGuid === eavConstants.pipelineDesigner.outDataSource.EntityGuid
    };

    // Add endpoint and add label and css in case it must be angled
    const endpoint = this.instance.addEndpoint(domDataSource, model, params);
    const overlay = endpoint.getOverlay('endpointLabel');
    overlay.setLabel(endpointInfo.name);
    // if (angled)
    //   overlay.addClass('angled');
    l.end("end", {count, overlay});
  }

  reOrientAllLabels() {
    const l = this.log.fnIf('reOrientAllLabels');
    const parts = this.pipelineModel.DataSources.map(ds => ds.EntityGuid);

    parts.forEach(guid => {
      // [true, false].forEach(isTarget => {

      // Messy way to split the endpoints into in and out points  
      const endpoints = this.instance.selectEndpoints({ element: domIdOfGuid(guid) });
      const inPoints: JsPlumbEndpoint[] = [];
      const outPoints: JsPlumbEndpoint[] = [];
      endpoints.each((endpoint: JsPlumbEndpoint) => {
        if (endpoint.isTarget)
          inPoints.push(endpoint);
        else
          outPoints.push(endpoint);
      });

      this.#reorientListOfEndpoints(inPoints);
      this.#reorientListOfEndpoints(outPoints);
    });
    l.end();
  }

  #reorientListOfEndpoints(endpoints: JsPlumbEndpoint[]) {
    const countExceeded = endpoints.length > endPointsWhereWeRotate;

    const combinedLabels = endpoints.map(endpoint => getEndpointLabel(endpoint)).join(',');

    if (countExceeded || combinedLabels.length > maxLabelLengthToRotate)
      endpoints.forEach(element => element.addClass('angled'));
    else
      endpoints.forEach(element => element.removeClass('angled'));
  }


  removeAllEndpoints(dataSourceGuid: string) {
    const elementId = domIdOfGuid(dataSourceGuid);
    this.connections.bulkDelete = true;
    this.instance.batch(() => {
      this.instance.selectEndpoints({ element: elementId }).delete();
    });
    this.connections.bulkDelete = false;
  }

}

