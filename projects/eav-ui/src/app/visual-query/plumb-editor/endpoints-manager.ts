import { eavConstants } from '../../shared/constants/eav.constants';
import { classLog } from '../../shared/logging';
import { PipelineDataSource } from '../models';
import { ConnectionsManager } from './connections-manager';
import { findDefByType, getEndpointLabel } from './datasource.helpers';
import { EndpointDefinitionsService } from './endpoint-definitions';
import { JsPlumbEndpoint, JsPlumbInstance } from './jsplumb.models';
import { domIdOfGuid } from './plumber-constants';
import { QueryDataManager } from './query-data-manager';

const logSpecs = {
  all: false,
  addEndpoint: false,
  reOrientAllLabels: false,
  updateAfterChanges: false,
  wireHasConnection: false,
  mirrorEndpoints: false,
  fields: ['TestIn2', 'Default'],
}

const endPointsWhereWeRotate = 3;
const maxLabelLengthToRotate = 30;

export class EndpointsManager {
  log = classLog({EndpointsManager}, logSpecs);

  constructor(
    private instance: JsPlumbInstance, 
    private endpointDefs: EndpointDefinitionsService,
    private connections: ConnectionsManager,
    private queryData: QueryDataManager,
  ) { }

  
  addEndpoint(domDataSource: HTMLElement, endpointName: string, isIn: boolean, queryDs: PipelineDataSource, extraStyling?: string) {
    const l = this.log.fnIfInFields('addEndpoint', endpointName, { endpointName, isIn, queryDs });
    const dsDefinition = findDefByType(this.queryData.dataSources, queryDs.PartAssemblyAndType);
    const connectionList = isIn
      ? dsDefinition.In
      : dsDefinition.Out;
    const hasDynamic = connectionList?.some(name => this.endpointDefs.getInfo(name, false).required === false);
    const endpointInfo = this.endpointDefs.getInfo(endpointName, hasDynamic);

    l.a(`endpointInfo`, { dataSource: dsDefinition, connectionList, hasDynamic, endpointInfo });

    // if (endpointName === "DEBUG") debugger;

    // Figure out additional styling based on the endpoint type
    const style = hasDynamic
      ? 'dynamic' // dynamic endpoints are not required
      : !endpointInfo.required
        ? ''      // not required
        : this.#wireHasConnection(domDataSource, endpointInfo.name, isIn) ? '' : 'required'; // required - check if it's populated; otherwise make red


    const uuid = domDataSource.id + (isIn ? '_in_' : '_out_') + endpointInfo.name;
    const model = isIn
      ? this.endpointDefs.buildTargetDef(queryDs.EntityGuid, `${style} ${extraStyling}`)
      : this.endpointDefs.buildSourceDef(queryDs.EntityGuid, `${style} ${extraStyling}`);
    // Endpoints on Out-DataSource must be always enabled
    const params = {
      uuid,
      enabled: this.queryData.query.Pipeline.AllowEdit
        || queryDs.EntityGuid === eavConstants.pipelineDesigner.outDataSource.EntityGuid
    };

    // Add endpoint and add label and css in case it must be angled
    const endpoint = this.instance.addEndpoint(domDataSource, model, params);
    const overlay = endpoint.getOverlay('endpointLabel');
    overlay.setLabel(endpointInfo.name);
    l.end("end", {overlay});
  }

  /**
   * Check if a specific endpoint has a connection
   * Note that it uses the query model to check, not the DOM.
   * So in certain cases where a change is just being made, it could be wrong.
   */
  #wireHasConnection(domDataSource: HTMLElement, name: string, isIn: boolean = true) {
    const l = this.log.fnIf('wireHasConnection', { domDataSource, name, isIn });
    const wireExists = this.queryData.query.Pipeline.StreamWiring?.some(wire => isIn
        ? domIdOfGuid(wire.To) === domDataSource.id && wire.In === name
        : domIdOfGuid(wire.From) === domDataSource.id && wire.Out === name
    );
    return l.r(wireExists, 'wireExists' + wireExists);
  }

  #isDoingUpdate = false;

  updateAfterChanges() {
    const l = this.log.fnIf('updateAfterChanges', { query: this.queryData.query, isDoing: this.#isDoingUpdate });

    // Prevent loops
    if (this.#isDoingUpdate)
      return l.end('already doing update, exit');
    this.#isDoingUpdate = true;

    this.#mirrorEndpoints();

    this.#reOrientAllLabels();

    this.#isDoingUpdate = false;
    this.instance.repaintEverything();
    l.end('done');
  }

  #mirrorEndpoints() {
    const l = this.log.fnIf('mirrorEndpoints', { query: this.queryData.query });
    // Get all parts which have mirror-in mode
    const partsMirrorIn = this.queryData.query.DataSources
    .map(ds => {
      const def = findDefByType(this.queryData.dataSources, ds.PartAssemblyAndType);
      return (def.OutMode === 'mirror-in') ? { def, guid: ds.EntityGuid } : null;
    })
    .filter(d => d !== null);
    
    // Check if we need to mirror anything
    partsMirrorIn.forEach(ds => {
      const { inPoints, outPoints } = this.#getEndpointsByType(ds.guid);

      const inLabels = inPoints.map(p => ({ point: p, label: getEndpointLabel(p)}));
      const outLabels = outPoints.map(p => ({ point: p, label: getEndpointLabel(p)}));

      // Get mismatching lists of out and in
      const missingInOut = inLabels.filter(inP => !outLabels.some(outP => outP.label === inP.label));
      const outWithoutIn = outLabels.filter(outP => !inLabels.some(inP => inP.label === outP.label));
      l.a('inMissingInOut', { inPoints, outPoints, missingInOut, outWithoutIn });

      // Add missing labels to out
      const { domDataSource, dataSource } = this.queryData.findDataSourceAndDom(ds.guid);
      if (missingInOut.length) {
        missingInOut.forEach(p => this.addEndpoint(domDataSource, p.label, false, dataSource, 'mirror-in'));
      }

      // Remove excessive labels
      // Only consider the ones which have a `mirror-in` class and remove them
      outWithoutIn.forEach(p => {
        if (p.point.canvas.classList.contains('mirror-in')) {
          const hasConnection = p.point.connections?.length;
          if (!hasConnection)
            this.instance.deleteEndpoint(p.point);
        }
      });
    });  
  }

  /**
   * Ugly way to get the endpoints by type in/out. Not elegant, but don't know a better method ATM
   */
  #getEndpointsByType(guid: string) {
    const endpoints = this.instance.selectEndpoints({ element: domIdOfGuid(guid) });
    const inPoints: JsPlumbEndpoint[] = [];
    const outPoints: JsPlumbEndpoint[] = [];
    endpoints.each((ep: JsPlumbEndpoint) => (ep.isTarget ? inPoints : outPoints).push(ep));
    return { inPoints, outPoints };
  }

  /**
   * Check all labels and if there are too many, rotate them at an angle
   */
  #reOrientAllLabels() {
    const l = this.log.fnIf('reOrientAllLabels');
    const parts = this.queryData.query.DataSources.map(ds => ds.EntityGuid);

    parts.forEach(guid => {
      const {inPoints, outPoints} = this.#getEndpointsByType(guid);
      this.#reorientListOfEndpoints(inPoints);
      this.#reorientListOfEndpoints(outPoints);
    });
    l.end();
  }

  #reorientListOfEndpoints(endpoints: JsPlumbEndpoint[]) {
    const countExceeded = endpoints.length > endPointsWhereWeRotate;

    const labels = endpoints.map(endpoint => getEndpointLabel(endpoint)).join(',');

    if (countExceeded || labels.length > maxLabelLengthToRotate)
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

