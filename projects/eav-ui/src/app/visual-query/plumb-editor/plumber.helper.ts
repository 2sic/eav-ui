import { classLog } from '../../shared/logging';
import { DataSourceInstance } from '../models/data-source-instance.model';
import { QueryStreamResult } from '../models/result/PipelineResultStream';
import { VisualDesignerData } from '../models/visual-designer-data';
import { VisualQueryModel } from '../models/visual-query.model';
import { ConnectionLineColors } from './connection-line-colors';
import { ConnectionsManager } from './connections-manager';
import { getEndpointLabel } from './datasource.helpers';
import { EndpointDefinitionsService } from './endpoint-definitions';
import { EndpointLabelRenameParts } from './endpoint-label-rename.model';
import { EndpointsManager } from './endpoints-manager';
import { JsPlumbInstanceManager } from './jsplumb-instance-manager';
import { JsPlumbEndpoint, JsPlumbInstance } from './jsplumb.models';
import { LinesDecorator } from './lines-decorator';
import { domIdOfGuid, guidOfDomId } from './plumber-constants';
import { QueryDataManager } from './query-data-manager';
import { WiringsHelper } from './wirings.helper';

const logSpecs = {
  all: false,
  addEndpoint: true,
  initDomDataSources: false,
  eventConnectionDetached: true,
  eventConnectionAttached: true,
  fields: ['TestIn2'],
}

export class Plumber {

  log = classLog({Plumber}, logSpecs);

  #instance: JsPlumbInstance;

  lineColors = new ConnectionLineColors();

  #endpointDefs: EndpointDefinitionsService;

  lineDecorator: LinesDecorator;

  connections: ConnectionsManager;

  #instanceManager: JsPlumbInstanceManager;

  endpoints: EndpointsManager;

  queryData: QueryDataManager;

  constructor(
    private jsPlumbRoot: HTMLElement,
    private query: VisualQueryModel,
    private dataSources: DataSourceInstance[],
    private onConnectionsChangedParent: () => void,
    private onDragend: (pipelineDataSourceGuid: string, position: VisualDesignerData) => void,
    private onDebugStream: (stream: QueryStreamResult) => void,
    renameDialogParts: EndpointLabelRenameParts,
  ) {
    this.queryData = new QueryDataManager(this.jsPlumbRoot, this.query, this.dataSources);
    this.#endpointDefs = new EndpointDefinitionsService(query, { ...renameDialogParts, onConnectionsChanged: () => this.#onConnectionsChanged() });
    this.#instanceManager = new JsPlumbInstanceManager(this.jsPlumbRoot, this.lineColors);
    this.#instance = this.#instanceManager.instance;
    // requires instance, so must happen after that
    this.lineDecorator = new LinesDecorator(this.#instance, this.query, this.onDebugStream);
    this.connections = new ConnectionsManager(this.#instance, this.query, this.dataSources, this.#endpointDefs, () => this.#onConnectionsChanged());
    this.endpoints = new EndpointsManager(this.#instance, this.#endpointDefs, this.connections, this.queryData);

    // Suspend drawing while initializing
    this.#instance.batch(() => {
      this.#initDomDataSources();
      new WiringsHelper(this, this.#instance, this.queryData).initWirings();
      this.connections.setup();
      this.endpoints.updateAfterChanges();
    });

    // spm NOTE: repaint after initial paint fixes:
    // Error: <svg> attribute width: Expected length, "-Infinity".
    this.#instance.repaintEverything();

  }
  #onConnectionsChanged() {
    // After connection changes, re-check if we need to slant the labels
    this.endpoints.updateAfterChanges();
    // call the parent for storing the data etc.
    this.onConnectionsChangedParent();
  }

  destroy() {
    this.#instanceManager.destroy();
  }

  removeAllEndpoints(pipelineDataSourceGuid: string) {
    const elementId = domIdOfGuid(pipelineDataSourceGuid);
    this.connections.bulkDelete = true;
    this.#instance.batch(() => {
      this.#instance.selectEndpoints({ element: elementId }).delete();
    });
    this.connections.bulkDelete = false;
  }

  getStreamsOut() {
    const streamsOut: string[] = [];
    this.#instance
      .selectEndpoints({ target: domIdOfGuid('Out') })
      .each((endpoint: JsPlumbEndpoint) => {
        streamsOut.push(getEndpointLabel(endpoint));
      });
    const streamsOutStr = streamsOut.join(',');
    return streamsOutStr;
  }

  /** Create sources, targets and endpoints */
  #initDomDataSources() {
    const l = this.log.fnIf('initDomDataSources');
    for (const queryDs of this.query.DataSources) {
      const { domDataSource: domDs, definition: dataSource } = this.queryData.findDomAndDef(queryDs.EntityGuid, queryDs.PartAssemblyAndType);
      if (!domDs)
        continue;

      if (this.query.Pipeline.AllowEdit) {
        // WARNING! Must happen before instance.makeSource()
        this.#instance.draggable(domDs, {
          grid: [20, 20],
          stop: (event: { el: HTMLElement, finalPos: number[] }) => {
            const element: HTMLElement = event.el;
            const queryDsGuid: string = guidOfDomId(element.id);
            const position: VisualDesignerData = {
              Top: event.finalPos[1],
              Left: event.finalPos[0],
            };
            setTimeout(() => this.onDragend(queryDsGuid, position));
          }
        });
      }

      // Add Out-Endpoints from Definition
      const outCount = dataSource.Out?.length ?? 0;
      l.a('dataSource.Out', { outCount, out: dataSource.Out });
      dataSource.Out?.forEach(name => {
        this.endpoints.addEndpoint(domDs, name, name, false, queryDs);
      });

      // Add dynamic Out-Endpoints (if .OutMode is not static)
      if (dataSource.OutMode != 'static') {
        const dynOut = this.#endpointDefs.buildSourceDef(queryDs.EntityGuid);
        this.#instance.makeSource(domDs, dynOut, { filter: '.add-endpoint' });
      }

      // Add In-Endpoints from Definition
      const inCount = dataSource.In?.length ?? 0;
      l.a('dataSource.In', { inCount, in: dataSource.In });
      dataSource.In?.forEach(name => {
        this.endpoints.addEndpoint(domDs, name, name, true, queryDs);
      });

      // Make DataSource a Target for new Endpoints (if .In is an Array)
      if (dataSource.In) {
        const targetEndpointUnlimited = this.#endpointDefs.buildTargetDef(queryDs.EntityGuid);
        targetEndpointUnlimited.maxConnections = -1;
        this.#instance.makeTarget(domDs, targetEndpointUnlimited);
      }

    }
    l.end();
  }


}
