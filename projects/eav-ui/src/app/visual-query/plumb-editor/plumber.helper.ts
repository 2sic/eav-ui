import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui';
import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineModel, PipelineResultStream, VisualDesignerData } from '../models';
import { ConnectionLineColors } from './connection-line-colors';
import { ConnectionsManager } from './connections-manager';
import { getEndpointLabel } from './datasource.helpers';
import { EndpointDefinitionsService } from './endpoint-definitions';
import { EndpointLabelRenameParts } from './endpoint-label-rename.model';
import { EndpointsManager } from './endpoints-manager';
import { JsPlumbInstanceManager } from './jsplumb-instance-manager';
import { JsPlumbEndpoint, JsPlumbInstanceOld } from './jsplumb.models';
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

  log = classLogEnabled({ Plumber }, logSpecs);

  #instance: BrowserJsPlumbInstance;
  #instanceOld: JsPlumbInstanceOld;

  lineColors = new ConnectionLineColors();

  #endpointDefs: EndpointDefinitionsService;

  lineDecorator: LinesDecorator;

  connections: ConnectionsManager;

  #instanceManager: JsPlumbInstanceManager;

  endpoints: EndpointsManager;

  queryData: QueryDataManager;

  constructor(
    private jsPlumbRoot: HTMLElement,
    private query: PipelineModel,
    private dataSources: DataSource[],
    private onConnectionsChangedParent: () => void,
    private onDragend: (pipelineDataSourceGuid: string, position: VisualDesignerData) => void,
    private onDebugStream: (stream: PipelineResultStream) => void,
    renameDialogParts: EndpointLabelRenameParts,
  ) {
    this.queryData = new QueryDataManager(this.jsPlumbRoot, this.query, this.dataSources);
    this.#endpointDefs = new EndpointDefinitionsService(query, { ...renameDialogParts, onConnectionsChanged: () => this.#onConnectionsChanged() });
    this.#instanceManager = new JsPlumbInstanceManager(this.jsPlumbRoot, this.lineColors);
    this.#instance = this.#instanceManager.instance;
    this.#instanceOld = this.#instanceManager.instanceOld;
    // requires instance, so must happen after that
    this.lineDecorator = new LinesDecorator(this.#instance, this.#instanceOld, this.query, this.onDebugStream);
    this.connections = new ConnectionsManager(this.#instanceOld, this.query, this.dataSources, this.#endpointDefs, () => this.#onConnectionsChanged());
    this.endpoints = new EndpointsManager(this.#instanceOld, this.#endpointDefs, this.connections, this.queryData);

    // Suspend drawing while initializing
    this.#instanceOld.batch(() => {
      this.#initDomDataSources();
      new WiringsHelper(this, this.#instance, this.#instanceOld, this.queryData).initWirings();
      this.connections.setup();
      this.endpoints.updateAfterChanges();
    });

    // spm NOTE: repaint after initial paint fixes:
    // Error: <svg> attribute width: Expected length, "-Infinity".
    this.#instanceOld.repaintEverything();

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
    this.#instanceOld.batch(() => {
      this.#instanceOld.selectEndpoints({ element: elementId }).delete();
    });
    this.connections.bulkDelete = false;
  }

  getStreamsOut() {
    const streamsOut: string[] = [];
    this.#instanceOld
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
        this.#instanceOld.draggable(domDs, {
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
        this.endpoints.addEndpoint(domDs, name, false, queryDs);
        
        this.#instance.addEndpoint(domDs, {
          uuid: `${domDs.id}_out_${name}`,
          parameters: { name, isIn: true, dataSource: queryDs },
        });
      });

      // Add dynamic Out-Endpoints (if .OutMode is not static)
      if (dataSource.OutMode != 'static') {
        const dynOut = this.#endpointDefs.buildSourceDef(queryDs.EntityGuid);
        this.#instanceOld.makeSource(domDs, dynOut, { filter: '.add-endpoint' });
      }

      // Add In-Endpoints from Definition
      const inCount = dataSource.In?.length ?? 0;
      l.a('dataSource.In', { inCount, in: dataSource.In });
      dataSource.In?.forEach(name => {
        this.endpoints.addEndpoint(domDs, name, true, queryDs);

        this.#instance.addEndpoint(domDs, {
          uuid: `${domDs.id}_in_${name}`,
          parameters: { name, isIn: true, dataSource: queryDs },
        });
      });

      // Make DataSource a Target for new Endpoints (if .In is an Array)
      if (dataSource.In) {
        const targetEndpointUnlimited = this.#endpointDefs.buildTargetDef(queryDs.EntityGuid);
        targetEndpointUnlimited.maxConnections = -1;
        this.#instanceOld.makeTarget(domDs, targetEndpointUnlimited);
      }

    }
    l.end();
  }
}
