import { ObjectModel } from '../../shared/models/dictionary.model';
import { EavWindow } from '../../shared/models/eav-window.model';
import { DataSource } from '../models/data-sources.model';
import { PipelineResult } from '../models/pipeline-result.model';
import { PipelineDataSource, PipelineModel, StreamWire, VisualDesignerData } from '../models/pipeline.model';
import { PlumbType } from './plumb-editor.models';

declare const window: EavWindow;

export const dataSrcIdPrefix = 'dataSource_';

export class Plumber {
  private instance: PlumbType;
  private lineCount = 0;
  private linePaintDefault = {
    stroke: '#61B7CF',
    strokeWidth: 4,
    outlineStroke: 'white',
    outlineWidth: 2,
  };
  private lineColors = [
    '#009688', '#00bcd4', '#3f51b5', '#9c27b0', '#e91e63',
    '#db4437', '#ff9800', '#60a917', '#60a917', '#008a00',
    '#00aba9', '#1ba1e2', '#0050ef', '#6a00ff', '#aa00ff',
    '#f472d0', '#d80073', '#a20025', '#e51400', '#fa6800',
    '#f0a30a', '#e3c800', '#825a2c', '#6d8764', '#647687',
    '#76608a', '#a0522d',
  ];
  private maxCols = this.lineColors.length - 1;
  private uuidColorMap: ObjectModel<any> = {};
  private bulkDelete = false;

  constructor(
    private jsPlumbRoot: HTMLElement,
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[],
    private onConnectionsChanged: () => void,
    private onDragend: (pipelineDataSourceGuid: string, position: VisualDesignerData) => void,
    /** Workaround for multiple dblClick listeners */
    private plumbInits: number,
  ) {
    this.instance = window.jsPlumb.getInstance(this.getInstanceDefaults(this.jsPlumbRoot));
    this.instance.batch(() => {
      this.initDomDataSources();
      this.initWirings();
      this.bindEvents();
    });
    // spm NOTE: repaint after initial paint fixes:
    // Error: <svg> attribute width: Expected length, "-Infinity".
    this.instance.repaintEverything();
  }

  destroy() {
    this.instance.reset();
  }

  removeEndpointsOnDataSource(pipelineDataSourceGuid: string) {
    const elementId = dataSrcIdPrefix + pipelineDataSourceGuid;
    this.bulkDelete = true;
    this.instance.batch(() => {
      this.instance.selectEndpoints({ element: elementId }).delete();
    });
    this.bulkDelete = false;
  }

  getAllConnections() {
    const connectionInfos: StreamWire[] = this.instance.getAllConnections().map((connection: PlumbType) => {
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
    this.instance.selectEndpoints({ target: dataSrcIdPrefix + 'Out' }).each((endpoint: PlumbType) => {
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

      const sEndp: PlumbType = this.instance.getEndpoint(fromUuid);
      sEndp?.connections?.forEach((connection: PlumbType) => {
        if (connection.endpoints[1].getUuid() !== toUuid) { return; }

        connection.setLabel({ label: stream.Count.toString(), cssClass: 'streamEntitiesCount' });
      });
    });
  }

  private nextLinePaintStyle(uuid: string) {
    return (
      this.uuidColorMap[uuid] ||
      (this.uuidColorMap[uuid] = Object.assign({}, this.linePaintDefault, { stroke: this.lineColors[this.lineCount++ % this.maxCols] }))
    );
  }

  private getInstanceDefaults(container: HTMLElement) {
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
  private initDomDataSources() {
    for (const pipelineDataSource of this.pipelineModel.DataSources) {
      const domDataSource: HTMLElement = this.jsPlumbRoot.querySelector('#' + dataSrcIdPrefix + pipelineDataSource.EntityGuid);
      if (!domDataSource) { continue; }
      const dataSource = this.dataSources.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
      if (!dataSource) { continue; }

      if (this.pipelineModel.Pipeline.AllowEdit) {
        // WARNING! Must happen before instance.makeSource()
        this.instance.draggable(domDataSource, {
          grid: [20, 20], stop: (event: PlumbType) => {
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
      dataSource.Out?.forEach(name => {
        this.addEndpoint(domDataSource, name, false, pipelineDataSource);
      });

      // Add Out-Endpoints from Definition
      dataSource.In?.forEach(name => {
        this.addEndpoint(domDataSource, name, true, pipelineDataSource);
      });

      // Make DataSource a Target for new Endpoints (if .In is an Array)
      if (dataSource.In) {
        const targetEndpointUnlimited = this.buildTargetEndpoint();
        targetEndpointUnlimited.maxConnections = -1;
        this.instance.makeTarget(domDataSource, targetEndpointUnlimited);
      }

      if (dataSource.DynamicOut) {
        this.instance.makeSource(domDataSource, this.buildSourceEndpoint(), { filter: '.add-endpoint .new-connection' });
      }
    }
  }

  /** Create wires */
  private initWirings() {
    this.pipelineModel.Pipeline.StreamWiring?.forEach(wire => {
      // read connections from Pipeline
      const sourceElementId = dataSrcIdPrefix + wire.From;
      const fromUuid = sourceElementId + '_out_' + wire.Out;
      const targetElementId = dataSrcIdPrefix + wire.To;
      const toUuid = targetElementId + '_in_' + wire.In;

      // Ensure In-Endpoint exist
      if (!this.instance.getEndpoint(fromUuid)) {
        const domDataSource: HTMLElement = this.jsPlumbRoot.querySelector('#' + sourceElementId);
        const guid: string = domDataSource.id.replace(dataSrcIdPrefix, '');
        const pipelineDataSource = this.pipelineModel.DataSources.find(pipeDataSource => pipeDataSource.EntityGuid === guid);
        this.addEndpoint(domDataSource, wire.Out, false, pipelineDataSource);
      }

      // Ensure Out-Endpoint exist
      if (!this.instance.getEndpoint(toUuid)) {
        const domDataSource: HTMLElement = this.jsPlumbRoot.querySelector('#' + targetElementId);
        const guid: string = domDataSource.id.replace(dataSrcIdPrefix, '');
        const pipelineDataSource = this.pipelineModel.DataSources.find(pipeDataSource => pipeDataSource.EntityGuid === guid);
        this.addEndpoint(domDataSource, wire.In, true, pipelineDataSource);
      }

      try {
        this.instance.connect({
          uuids: [fromUuid, toUuid],
          paintStyle: this.nextLinePaintStyle(fromUuid),
        });
      } catch (e) {
        console.error({ message: 'Connection failed', from: fromUuid, to: toUuid });
      }
    });
  }

  private addEndpoint(domDataSource: HTMLElement, name: string, isIn: boolean, pipelineDataSource: PipelineDataSource) {
    const uuid = domDataSource.id + (isIn ? '_in_' : '_out_') + name;
    const model = isIn ? this.buildTargetEndpoint() : this.buildSourceEndpoint();
    // Endpoints on Out-DataSource must be always enabled
    const params = { uuid, enabled: this.pipelineModel.Pipeline.AllowEdit || pipelineDataSource.EntityGuid === 'Out' };

    const endPoint: PlumbType = this.instance.addEndpoint(domDataSource, model, params);
    endPoint.getOverlay('endpointLabel').setLabel(name);
  }

  private buildSourceEndpoint() {
    const sourceEndpoint = {
      paintStyle: { fill: 'transparent', radius: 10 },
      cssClass: 'sourceEndpoint',
      maxConnections: -1,
      isSource: true,
      anchor: ['Continuous', { faces: ['top'] }],
      overlays: this.getEndpointOverlays(true)
    };
    return sourceEndpoint;
  }

  private buildTargetEndpoint() {
    const targetEndpoint = {
      paintStyle: { fill: 'transparent', radius: 10 },
      cssClass: 'targetEndpoint',
      maxConnections: 1,
      isTarget: true,
      anchor: ['Continuous', { faces: ['bottom'] }],
      overlays: this.getEndpointOverlays(false),
      dropOptions: { hoverClass: 'hover', activeClass: 'active' }
    };
    return targetEndpoint;
  }

  private getEndpointOverlays(isSource: boolean) {
    return [
      [
        'Label', {
          id: 'endpointLabel',
          // location: [0.5, isSource ? -0.5 : 1.5],
          location: [0.5, isSource ? 0 : 1],
          label: 'Default',
          cssClass: 'noselect ' + (isSource ? 'endpointSourceLabel' : 'endpointTargetLabel'),
          events: {
            dblclick: (labelOverlay: PlumbType) => {
              if (!this.pipelineModel.Pipeline.AllowEdit) { return; }

              // spm NOTE: workaround for multiple dblclick listeners
              if (labelOverlay.dblClickCounter == null || labelOverlay.dblClickCounter >= this.plumbInits) {
                labelOverlay.dblClickCounter = 1;
              } else {
                labelOverlay.dblClickCounter++;
              }
              if (labelOverlay.dblClickCounter > 1) { return; }

              const newLabel = prompt('Rename stream', labelOverlay.label);
              if (!newLabel) { return; }
              labelOverlay.setLabel(newLabel);
              setTimeout(() => { this.onConnectionsChanged(); });
            }
          }
        }
      ]
    ];
  }

  private bindEvents() {
    // If connection on Out-DataSource was removed, remove custom Endpoint
    this.instance.bind('connectionDetached', (info: PlumbType) => {
      // spm TODO: custom endpoints were removed only on Out DataSource. Bug?
      // if (info.targetId !== dataSrcIdPrefix + 'Out') { return; }
      if (this.bulkDelete) { return; }
      const domDataSource: HTMLElement = info.target;
      const pipelineDataSource = this.pipelineModel.DataSources.find(
        pipelineDS => pipelineDS.EntityGuid === domDataSource.id.replace(dataSrcIdPrefix, '')
      );
      const dataSource = this.dataSources.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
      const fixedEndpoints = dataSource.In;
      const label: string = info.targetEndpoint.getOverlay('endpointLabel').label;
      if (fixedEndpoints.includes(label)) {
        setTimeout(() => { this.onConnectionsChanged(); });
        return;
      }
      this.instance.deleteEndpoint(info.targetEndpoint);
      setTimeout(() => { this.onConnectionsChanged(); });
    });

    this.instance.bind('connection', (info: PlumbType) => {
      if (info.sourceId === info.targetId) {
        setTimeout(() => {
          this.instance.deleteConnection(info.connection, { fireEvent: false });
          setTimeout(() => { this.onConnectionsChanged(); });
        });
        return;
      }
      const endpointLabel: PlumbType = info.targetEndpoint.getOverlay('endpointLabel');
      const labelPrompt: string = endpointLabel.getLabel();
      const endpoints: PlumbType[] = this.instance.getEndpoints(info.target.id);
      const targetEndpointHasSameLabel = endpoints.some(endpoint => {
        const label: string = endpoint.getOverlay('endpointLabel').getLabel();
        return label === labelPrompt &&
          info.targetEndpoint.id !== endpoint.id &&
          (endpoint.canvas as HTMLCanvasElement).classList.contains('targetEndpoint');
      });
      if (targetEndpointHasSameLabel) {
        endpointLabel.setLabel(`PleaseRename${Math.floor(Math.random() * 99999)}`);
      }
      setTimeout(() => { this.onConnectionsChanged(); });
    });
  }

}
