import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { eavConstants } from '../../shared/constants/eav.constants';
import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineDataSource, PipelineModel, PipelineResultStream, VisualDesignerData } from '../models';
import { ConnectionLineColors } from './connection-line-colors';
import { ConnectionsManager } from './connections-manager';
import { findDefByType, getEndpointLabel } from './datasource.helpers';
import { EndpointsHelper } from './endpoints.helper';
import { JsPlumbInstanceManager } from './jsplumb-instance-manager';
import { JsPlumbEndpoint, JsPlumbInstance, JsPlumbOverlay } from './jsplumb.models';
import { LinesDecorator } from './lines-decorator';
import { dataSrcIdPrefix } from './plumber-constants';
import { RenameStreamComponent } from './rename-stream/rename-stream.component';
import { RenameStreamDialogData } from './rename-stream/rename-stream.models';
import { WiringsHelper } from './wirings.helper';

const logSpecs = {
  all: false,
  addEndpoint: true,
  initDomDataSources: false,
  eventConnectionDetached: true,
  eventConnectionAttached: true,
  fields: ['TestIn2'],
}

const endPointsWhereWeRotate = 3;

export class Plumber {

  log = classLogEnabled({Plumber}, logSpecs);

  #instance: JsPlumbInstance;

  lineColors = new ConnectionLineColors();

  #endpoints: EndpointsHelper;

  lineDecorator: LinesDecorator;

  connections: ConnectionsManager;

  #instanceManager: JsPlumbInstanceManager;

  constructor(
    private jsPlumbRoot: HTMLElement,
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[],
    private onConnectionsChanged: () => void,
    private onDragend: (pipelineDataSourceGuid: string, position: VisualDesignerData) => void,
    private onDebugStream: (stream: PipelineResultStream) => void,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.#endpoints = new EndpointsHelper(this);
    this.#instanceManager = new JsPlumbInstanceManager(this.jsPlumbRoot, this.lineColors);
    this.#instance = this.#instanceManager.instance;
    // requires instance, so must happen after that
    this.lineDecorator = new LinesDecorator(this.#instance, this.pipelineModel, this.onDebugStream);
    this.connections = new ConnectionsManager(this.#instance, this.pipelineModel, this.dataSources, this.#endpoints, this.onConnectionsChanged);

    // Suspend drawing while initializing
    this.#instance.batch(() => {
      this.#initDomDataSources();
      new WiringsHelper(this, this.#instance, this.jsPlumbRoot, this.pipelineModel, this.dataSources).initWirings();
      this.connections.setup();
    });

    // spm NOTE: repaint after initial paint fixes:
    // Error: <svg> attribute width: Expected length, "-Infinity".
    this.#instance.repaintEverything();
  }

  destroy() {
    this.#instanceManager.destroy();
  }

  removeAllEndpoints(pipelineDataSourceGuid: string) {
    const elementId = dataSrcIdPrefix + pipelineDataSourceGuid;
    this.connections.bulkDelete = true;
    this.#instance.batch(() => {
      this.#instance.selectEndpoints({ element: elementId }).delete();
    });
    this.connections.bulkDelete = false;
  }

  getStreamsOut() {
    const streamsOut: string[] = [];
    this.#instance
      .selectEndpoints({ target: dataSrcIdPrefix + 'Out' })
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
      const domDs = this.jsPlumbRoot.querySelector<HTMLElement>('#' + dataSrcIdPrefix + queryDs.EntityGuid);
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
            const queryDsGuid: string = element.id.replace(dataSrcIdPrefix, '');
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
        this.addEndpoint(domDs, name, false, queryDs, outCount);
      });

      // Add dynamic Out-Endpoints (if .OutMode is not static)
      if (dataSource.OutMode != 'static') {
        const dynOut = this.#endpoints.buildSourceEndpoint(queryDs.EntityGuid);
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
        this.addEndpoint(domDs, name, true, queryDs, inCount);
      });

      // Make DataSource a Target for new Endpoints (if .In is an Array)
      if (dataSource.In) {
        const targetEndpointUnlimited = this.#endpoints.buildTargetEndpoint(queryDs.EntityGuid);
        targetEndpointUnlimited.maxConnections = -1;
        this.#instance.makeTarget(domDs, targetEndpointUnlimited);
      }

    }
    l.end();
  }


  addEndpoint(domDataSource: HTMLElement, endpointName: string, isIn: boolean, queryDs: PipelineDataSource, count: number = 0) {
    const l = this.log.fnIfInList('addEndpoint', 'fields', endpointName, { endpointName, isIn, queryDs });
    const dsDefinition = findDefByType(this.dataSources, queryDs.PartAssemblyAndType);
    const connectionList = isIn
      ? dsDefinition.In
      : dsDefinition.Out;
    const hasDynamic = connectionList?.some(name => this.#endpoints.getEndpointInfo(name, false));
    // const count = connectionList?.length ?? -1;
    const endpointInfo = this.#endpoints.getEndpointInfo(endpointName, hasDynamic);

    l.a(`endpointInfo ${count}`, { dataSource: dsDefinition, connectionList, hasDynamic, count, endpointInfo });

    // if (endpointName === "DEBUG") debugger;

    let style: string;
    if (hasDynamic)
      style = 'dynamic';
    else if (!endpointInfo.required)
      style = '';
    else {
      const wireExists = this.pipelineModel.Pipeline.StreamWiring?.some(wire => {
        const targetElementId = dataSrcIdPrefix + wire.To;
        const targetEndpointName = wire.In;

        return targetElementId === domDataSource.id && targetEndpointName === endpointInfo.name;
      });
      style = wireExists ? '' : 'required';
    }

    const uuid = domDataSource.id + (isIn ? '_in_' : '_out_') + endpointInfo.name;
    const angled = count > endPointsWhereWeRotate;
    const model = isIn
      ? this.#endpoints.buildTargetEndpoint(queryDs.EntityGuid, style)
      : this.#endpoints.buildSourceEndpoint(queryDs.EntityGuid, style);
    // Endpoints on Out-DataSource must be always enabled
    const params = {
      uuid,
      enabled: this.pipelineModel.Pipeline.AllowEdit
        || queryDs.EntityGuid === eavConstants.pipelineDesigner.outDataSource.EntityGuid
    };

    // Add endpoint and add label and css in case it must be angled
    const endpoint: JsPlumbEndpoint = this.#instance.addEndpoint(domDataSource, model, params);
    const overlay = endpoint.getOverlay('endpointLabel');
    overlay.setLabel(endpointInfo.name);
    if (angled)
      overlay.addClass('angled');
    l.end("end", {count, angled, overlay});
  }

  public onChangeLabel(endpointOrOverlay: JsPlumbEndpoint | JsPlumbOverlay, isSource: boolean, pipelineDataSourceGuid: string) {
    if (!this.pipelineModel.Pipeline.AllowEdit)
      return;

    const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint)?.getOverlay('endpointLabel')
      ?? endpointOrOverlay as JsPlumbOverlay;

    this.matDialog
      .open(RenameStreamComponent, {
        autoFocus: false,
        data: {
          pipelineDataSourceGuid,
          isSource,
          label: overlay.label,
        } satisfies RenameStreamDialogData,
        viewContainerRef: this.viewContainerRef,
        width: '650px',
      })
      .afterClosed().subscribe(newLabel => {
        if (!newLabel)
          return;
        overlay.setLabel(newLabel);
        setTimeout(() => this.onConnectionsChanged());
      });

    this.changeDetectorRef.markForCheck();
  }


}
