import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineModel, StreamWire } from '../models';
import { findDefByType, getEndpointLabel } from './datasource.helpers';
import { EndpointDefinitionsService } from './endpoint-definitions';
import { JsPlumbConnection, JsPlumbInstanceOld } from './jsplumb.models';
import { guidOfDomId } from './plumber-constants';

const logSpecs = {
  all: false,
  eventConnectionDetached: false,
  eventConnectionAttached: false,
}

export class ConnectionsManager {
  log = classLogEnabled({ConnectionsManager}, logSpecs);
  bulkDelete: boolean = false;

  constructor(
    private instance: JsPlumbInstanceOld, 
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[],
    private endpointsSvc: EndpointDefinitionsService,
    private onConnectionsChanged: () => void,
  ) { }

  /**
   * Handle attach/detach of connections
   */
  setup(): void{
    this.instance.bind('connectionDetached', (info: JsPlumbConnection) => this.handleDetached(info));
    this.instance.bind('connection', (info: JsPlumbConnection) => this.handleAttached(info));
  }

  getAll(): StreamWire[] {
    const connectionInfos: StreamWire[] = this.instance.getAllConnections()
      .map((connection: JsPlumbConnection) => ({
        From: guidOfDomId(connection.sourceId),
        Out: getEndpointLabel(connection.endpoints[0]),
        To: guidOfDomId(connection.targetId),
        In: getEndpointLabel(connection.endpoints[1]),
      } satisfies StreamWire)
    );
    return connectionInfos;
  }
  
  
  handleDetached(info: JsPlumbConnection) {
    const l = this.log.fnIf('eventConnectionDetached');
    if (this.bulkDelete)
      return l.end('in bulk-delete mode, exit');

    const domDataSource = info.target;
    const pipelineDataSource = this.pipelineModel.DataSources.find(
      pipelineDS => pipelineDS.EntityGuid === guidOfDomId(domDataSource.id)
    );
    const dataSource = findDefByType(this.dataSources, pipelineDataSource.PartAssemblyAndType);
    const label = getEndpointLabel(info.targetEndpoint);
    const isDynamic = !dataSource.In.some(name => this.endpointsSvc.getInfo(name, false).name === label);
    if (isDynamic)
      this.instance.deleteEndpoint(info.targetEndpoint);
    setTimeout(() => this.onConnectionsChanged());
    l.end('done');
  }

  handleAttached(info: JsPlumbConnection) {
    const l = this.log.fnIf('eventConnectionAttached');
    // This seems to handle a special detach case, but ATM 2025-04-03 I can't see where it would ever hit
    if (info.sourceId === info.targetId) {
      setTimeout(() => {
        this.instance.deleteConnection(info.connection, { fireEvent: false });
        setTimeout(() => this.onConnectionsChanged());
      });
      return l.end('self-connection, will delete and exit');
    }
    const targetEndpointOverlay = info.targetEndpoint.getOverlay('endpointLabel');
    const targetLabel = targetEndpointOverlay.getLabel();
    const endpoints = this.instance.getEndpoints(info.target.id);
    const targetHasSameLabel = endpoints.some(ep => {
      const label = getEndpointLabel(ep);
      return label === targetLabel && info.targetEndpoint.id !== ep.id && ep.canvas.classList.contains('targetEndpoint');
    });

    // If label already exists, create a PleaseRename label
    if (targetHasSameLabel)
      targetEndpointOverlay.setLabel(`PleaseRename${Math.floor(Math.random() * 99999)}`);
    setTimeout(() => this.onConnectionsChanged());
    l.end('done', { targetLabel, targetHasSameLabel });
  }


}

