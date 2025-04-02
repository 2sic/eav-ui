import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { eavConstants } from '../../shared/constants/eav.constants';
import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineDataSource, PipelineModel, PipelineResult, PipelineResultStream, StreamWire, VisualDesignerData } from '../models';
import { WindowWithJsPlumb } from '../window';
import { findDefByType } from './datasource.helpers';
import { EndpointsHelper } from './endpoints.helper';
import { JsPlumbConnection, JsPlumbEndpoint, JsPlumbOverlay } from './jsplumb.models';
import { PlumbUntypedAny } from './plumb-editor.models';
import { RenameStreamComponent } from './rename-stream/rename-stream.component';
import { RenameStreamDialogData } from './rename-stream/rename-stream.models';
import { WiringsHelper } from './wirings.helper';

const logSpecs = {
  all: false,
  addEndpoint: true,
  fields: ['TestIn2'],
}

declare const window: WindowWithJsPlumb;

export const dataSrcIdPrefix = 'dataSource_';

const endPointsWhereWeRotate = 3;

export class Plumber {

  log = classLogEnabled({Plumber}, logSpecs);

  #instance: PlumbUntypedAny;
  #lineCount = 0;
  #linePaintDefault = {
    stroke: '#61B7CF',
    strokeWidth: 4,
    outlineStroke: 'white',
    outlineWidth: 2,
  };
  #lineColors = [
    '#009688', '#00bcd4', '#3f51b5', '#9c27b0', '#e91e63',
    '#db4437', '#ff9800', '#60a917', '#60a917', '#008a00',
    '#00aba9', '#1ba1e2', '#0050ef', '#6a00ff', '#aa00ff',
    '#f472d0', '#d80073', '#a20025', '#e51400', '#fa6800',
    '#f0a30a', '#e3c800', '#825a2c', '#6d8764', '#647687',
    '#76608a', '#a0522d',
  ];
  #maxCols = this.#lineColors.length - 1;
  #uuidColorMap: Record<string, any> = {};
  #bulkDelete = false;
  #dialog: MatDialogRef<RenameStreamComponent>;

  #endpoints: EndpointsHelper;

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
    this.#instance = window.jsPlumb.getInstance(this.#getInstanceDefaults(this.jsPlumbRoot));
    this.#instance.batch(() => {
      this.#initDomDataSources();
      new WiringsHelper(this, this.#instance, this.jsPlumbRoot, this.pipelineModel, this.dataSources).initWirings();
      this.#bindEvents();
    });
    // spm NOTE: repaint after initial paint fixes:
    // Error: <svg> attribute width: Expected length, "-Infinity".
    this.#instance.repaintEverything();
  }

  destroy() {
    this.#dialog?.close();
    this.#instance.reset();
    this.#instance.unbindContainer();
  }

  removeEndpointsOnDataSource(pipelineDataSourceGuid: string) {
    const elementId = dataSrcIdPrefix + pipelineDataSourceGuid;
    this.#bulkDelete = true;
    this.#instance.batch(() => {
      this.#instance.selectEndpoints({ element: elementId }).delete();
    });
    this.#bulkDelete = false;
  }

  getAllConnections() {
    const connectionInfos: StreamWire[] = this.#instance.getAllConnections().map((connection: JsPlumbConnection) => {
      const wire: StreamWire = {
        From: connection.sourceId.replace(dataSrcIdPrefix, ''),
        Out: connection.endpoints[0].getOverlay('endpointLabel').label,
        To: connection.targetId.replace(dataSrcIdPrefix, ''),
        In: connection.endpoints[1].getOverlay('endpointLabel').label,
      };
      return wire;
    });
    return connectionInfos;
  }

  getStreamsOut() {
    const streamsOut: string[] = [];
    this.#instance.selectEndpoints({ target: dataSrcIdPrefix + 'Out' }).each((endpoint: JsPlumbEndpoint) => {
      streamsOut.push(endpoint.getOverlay('endpointLabel').label);
    });
    const streamsOutStr = streamsOut.join(',');
    return streamsOutStr;
  }

  putEntityCountOnConnections(result: PipelineResult) {
    result.Streams?.forEach(stream => {
      const sourceElementId = dataSrcIdPrefix + stream.Source;
      const outTargets = ['00000000-0000-0000-0000-000000000000', this.pipelineModel.Pipeline.EntityGuid];
      const targetElementId = outTargets.includes(stream.Target) ? dataSrcIdPrefix + 'Out' : dataSrcIdPrefix + stream.Target;

      const fromUuid = sourceElementId + '_out_' + stream.SourceOut;
      const toUuid = targetElementId + '_in_' + stream.TargetIn;

      const sEndp: JsPlumbEndpoint = this.#instance.getEndpoint(fromUuid);
      sEndp?.connections
        ?.filter((connection: JsPlumbConnection) => connection.endpoints[1].getUuid() === toUuid)
        ?.forEach((connection: JsPlumbConnection) => {
          const label = !stream.Error ? stream.Count.toString() : '';
          const cssClass = 'streamEntitiesCount ' + (!stream.Error ? '' : 'streamEntitiesError');
          connection.setLabel({
            label,
            cssClass,
            events: {
              click: () => {
                if (!this.pipelineModel.Pipeline.AllowEdit) return;
                this.onDebugStream(stream);
              },
            },
          });
        });
    });
  }

  nextLinePaintStyle(uuid: string) {
    return (
      this.#uuidColorMap[uuid] ||
      (this.#uuidColorMap[uuid] = Object.assign({}, this.#linePaintDefault, { stroke: this.#lineColors[this.#lineCount++ % this.#maxCols] }))
    );
  }

  #getInstanceDefaults(container: HTMLElement) {
    const defaults = {
      Container: container,
      Connector: ['Bezier', { curviness: 70 }],
      PaintStyle: this.nextLinePaintStyle('dummy'),
      HoverPaintStyle: {
        stroke: '#216477',
        strokeWidth: 4,
        outlineStroke: 'white',
        outlineWidth: 2,
      },
    };
    return defaults;
  }

  /** Create sources, targets and endpoints */
  #initDomDataSources() {
    const l = this.log.fnCond(false, 'initDomDataSources');
    for (const pipelineDataSource of this.pipelineModel.DataSources) {
      const domDataSource = this.jsPlumbRoot.querySelector<HTMLElement>('#' + dataSrcIdPrefix + pipelineDataSource.EntityGuid);
      if (!domDataSource) continue;
      const dataSource = findDefByType(this.dataSources, pipelineDataSource.PartAssemblyAndType);
      if (!dataSource) continue;

      if (this.pipelineModel.Pipeline.AllowEdit) {
        // WARNING! Must happen before instance.makeSource()
        this.#instance.draggable(domDataSource, {
          grid: [20, 20], stop: (event: PlumbUntypedAny) => {
            const element: HTMLElement = event.el;
            const pipelineDataSourceGuid: string = element.id.replace(dataSrcIdPrefix, '');
            const position: VisualDesignerData = {
              Top: event.finalPos[1],
              Left: event.finalPos[0],
            };
            setTimeout(() => { this.onDragend(pipelineDataSourceGuid, position); });
          }
        });
      }

      // Add Out-Endpoints from Definition
      const outCount = dataSource.Out?.length ?? 0;
      l.a('dataSource.Out', { outCount, out: dataSource.Out });
      dataSource.Out?.forEach(name => {
        this.addEndpoint(domDataSource, name, false, pipelineDataSource, outCount);
      });

      // Add dynamic Out-Endpoints (if .OutMode is not static)
      if (dataSource.OutMode != 'static') {
        const dynOut = this.#endpoints.buildSourceEndpoint(pipelineDataSource.EntityGuid);
        this.#instance.makeSource(domDataSource, dynOut, { filter: '.add-endpoint' });
      }

      // Add all in-Endpoints if OutMode is mirror-in
      if (dataSource.OutMode === 'mirror-in') {
        l.a('dataSource.OutMode', { outMode: dataSource.OutMode });
        dataSource.In?.forEach(name => {
          if (dataSource.Out?.some(outName => outName === name))
            return;
          // this.addEndpoint(domDataSource, name, false, pipelineDataSource, outCount);
        });
      }

      // Add In-Endpoints from Definition
      const inCount = dataSource.In?.length ?? 0;
      l.a('dataSource.In', { inCount, in: dataSource.In });
      dataSource.In?.forEach(name => {
        this.addEndpoint(domDataSource, name, true, pipelineDataSource, inCount);
      });

      // Make DataSource a Target for new Endpoints (if .In is an Array)
      if (dataSource.In) {
        const targetEndpointUnlimited = this.#endpoints.buildTargetEndpoint(pipelineDataSource.EntityGuid);
        targetEndpointUnlimited.maxConnections = -1;
        this.#instance.makeTarget(domDataSource, targetEndpointUnlimited);
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

    const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint).getOverlay
      ? (endpointOrOverlay as JsPlumbEndpoint).getOverlay('endpointLabel')
      : endpointOrOverlay as JsPlumbOverlay;
    const data: RenameStreamDialogData = {
      pipelineDataSourceGuid,
      isSource,
      label: overlay.label,
    };
    this.#dialog = this.matDialog.open(RenameStreamComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    this.#dialog.afterClosed().subscribe(newLabel => {
      if (!newLabel) return;
      overlay.setLabel(newLabel);
      setTimeout(() => this.onConnectionsChanged());
    });
    this.changeDetectorRef.markForCheck();
  }

  #bindEvents() {
    this.#instance.bind('connectionDetached', (info: PlumbUntypedAny) => {
      if (this.#bulkDelete)
        return;
      const domDataSource: HTMLElement = info.target;
      const pipelineDataSource = this.pipelineModel.DataSources.find(
        pipelineDS => pipelineDS.EntityGuid === domDataSource.id.replace(dataSrcIdPrefix, '')
      );
      const dataSource = findDefByType(this.dataSources, pipelineDataSource.PartAssemblyAndType);
      const label: string = info.targetEndpoint.getOverlay('endpointLabel').label;
      const isDynamic = !dataSource.In.some(name => this.#endpoints.getEndpointInfo(name, false).name === label);
      if (isDynamic)
        this.#instance.deleteEndpoint(info.targetEndpoint);
      setTimeout(() => { this.onConnectionsChanged(); });
    });

    this.#instance.bind('connection', (info: PlumbUntypedAny) => {
      if (info.sourceId === info.targetId) {
        setTimeout(() => {
          this.#instance.deleteConnection(info.connection, { fireEvent: false });
          setTimeout(() => this.onConnectionsChanged());
        });
        return;
      }
      const endpointLabel: JsPlumbOverlay = info.targetEndpoint.getOverlay('endpointLabel');
      const labelPrompt: string = endpointLabel.getLabel();
      const endpoints: JsPlumbEndpoint[] = this.#instance.getEndpoints(info.target.id);
      const targetEndpointHasSameLabel = endpoints.some(endpoint => {
        const label: string = endpoint.getOverlay('endpointLabel').getLabel();
        return label === labelPrompt &&
          info.targetEndpoint.id !== endpoint.id &&
          (endpoint.canvas as HTMLCanvasElement).classList.contains('targetEndpoint');
      });
      if (targetEndpointHasSameLabel)
        endpointLabel.setLabel(`PleaseRename${Math.floor(Math.random() * 99999)}`);
      setTimeout(() => { this.onConnectionsChanged(); });
    });
  }

}
