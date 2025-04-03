import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineModel, PipelineResultStream, VisualDesignerData } from '../models';
import { ConnectionLineColors } from './connection-line-colors';
import { ConnectionsManager } from './connections-manager';
import { findDefByType, getEndpointLabel } from './datasource.helpers';
import { EndpointDefinitionsService } from './endpoint-definitions';
import { EndpointLabelRenameParts } from './endpoint-label-rename.model';
import { EndpointsManager } from './endpoints-manager';
import { JsPlumbInstanceManager } from './jsplumb-instance-manager';
import { JsPlumbEndpoint, JsPlumbInstance } from './jsplumb.models';
import { LinesDecorator } from './lines-decorator';
import { domIdOfGuid, guidOfDomId } from './plumber-constants';
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

  log = classLogEnabled({Plumber}, logSpecs);

  #instance: JsPlumbInstance;

  lineColors = new ConnectionLineColors();

  #endpointDefs: EndpointDefinitionsService;

  lineDecorator: LinesDecorator;

  connections: ConnectionsManager;

  #instanceManager: JsPlumbInstanceManager;

  endpoints: EndpointsManager;

  constructor(
    private jsPlumbRoot: HTMLElement,
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[],
    private onConnectionsChangedParent: () => void,
    private onDragend: (pipelineDataSourceGuid: string, position: VisualDesignerData) => void,
    private onDebugStream: (stream: PipelineResultStream) => void,
    renameDialogParts: EndpointLabelRenameParts,
  ) {
    this.#endpointDefs = new EndpointDefinitionsService(pipelineModel, renameDialogParts);
    this.#instanceManager = new JsPlumbInstanceManager(this.jsPlumbRoot, this.lineColors);
    this.#instance = this.#instanceManager.instance;
    // requires instance, so must happen after that
    this.lineDecorator = new LinesDecorator(this.#instance, this.pipelineModel, this.onDebugStream);
    this.connections = new ConnectionsManager(this.#instance, this.pipelineModel, this.dataSources, this.#endpointDefs, () => this.#onConnectionsChanged());
    this.endpoints = new EndpointsManager(this.#instance, this.pipelineModel, this.dataSources, this.#endpointDefs, this.connections);

    // Suspend drawing while initializing
    this.#instance.batch(() => {
      this.#initDomDataSources();
      new WiringsHelper(this, this.#instance, this.jsPlumbRoot, this.pipelineModel, this.dataSources).initWirings();
      this.connections.setup();
      this.endpoints.reOrientAllLabels();
    });

    // spm NOTE: repaint after initial paint fixes:
    // Error: <svg> attribute width: Expected length, "-Infinity".
    this.#instance.repaintEverything();

  }
  #onConnectionsChanged() {
    // After connection changes, re-check if we need to slant the labels
    this.endpoints.reOrientAllLabels();
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
    for (const queryDs of this.pipelineModel.DataSources) {
      const domDs = this.jsPlumbRoot.querySelector<HTMLElement>('#' + domIdOfGuid(queryDs.EntityGuid));
      if (!domDs)
        continue;
      const dataSource = findDefByType(this.dataSources, queryDs.PartAssemblyAndType);
      if (!dataSource)
        continue;

      if (this.pipelineModel.Pipeline.AllowEdit) {
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
        this.endpoints.addEndpoint(domDs, name, false, queryDs, outCount);
      });

      // Add dynamic Out-Endpoints (if .OutMode is not static)
      if (dataSource.OutMode != 'static') {
        const dynOut = this.#endpointDefs.buildSourceDef(queryDs.EntityGuid);
        this.#instance.makeSource(domDs, dynOut, { filter: '.add-endpoint' });
      }

      // Add all in-Endpoints if OutMode is mirror-in
      // if (dataSource.OutMode === 'mirror-in') {
      //   l.a('dataSource.OutMode', { outMode: dataSource.OutMode });
      //   dataSource.In?.forEach(name => {
      //     if (dataSource.Out?.some(outName => outName === name))
      //       return;
      //     // this.addEndpoint(domDataSource, name, false, pipelineDataSource, outCount);
      //   });
      // }

      // Add In-Endpoints from Definition
      const inCount = dataSource.In?.length ?? 0;
      l.a('dataSource.In', { inCount, in: dataSource.In });
      dataSource.In?.forEach(name => {
        this.endpoints.addEndpoint(domDs, name, true, queryDs, inCount);
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


  // public onChangeLabel(endpointOrOverlay: JsPlumbEndpoint | JsPlumbOverlay, isSource: boolean, pipelineDataSourceGuid: string) {
  //   if (!this.pipelineModel.Pipeline.AllowEdit)
  //     return;

  //   const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint)?.getOverlay('endpointLabel')
  //     ?? endpointOrOverlay as JsPlumbOverlay;

  //   this.renameDialogParts.matDialog
  //     .open(RenameStreamComponent, {
  //       autoFocus: false,
  //       data: {
  //         pipelineDataSourceGuid,
  //         isSource,
  //         label: overlay.label,
  //       } satisfies RenameStreamDialogData,
  //       viewContainerRef: this.renameDialogParts.viewContainerRef,
  //       width: '650px',
  //     })
  //     .afterClosed().subscribe(newLabel => {
  //       if (!newLabel)
  //         return;
  //       overlay.setLabel(newLabel);
  //       setTimeout(() => this.renameDialogParts.onConnectionsChanged());
  //     });

  //   this.renameDialogParts.changeDetectorRef.markForCheck();
  // }


}
