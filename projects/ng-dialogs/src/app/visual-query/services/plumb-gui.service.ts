import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
declare const jsPlumb: any;

const linePaintDefault = {
  lineWidth: 4,
  strokeStyle: '#61B7CF',
  joinstyle: 'round',
  outlineColor: 'white',
  outlineWidth: 2
};
let lineCount = 0;
const lineColors = [
  '#009688', '#00bcd4', '#3f51b5', '#9c27b0', '#e91e63',
  '#db4437', '#ff9800', '#60a917', '#60a917', '#008a00',
  '#00aba9', '#1ba1e2', '#0050ef', '#6a00ff', '#aa00ff',
  '#f472d0', '#d80073', '#a20025', '#e51400', '#fa6800',
  '#f0a30a', '#e3c800', '#825a2c', '#6d8764', '#647687',
  '#76608a', '#a0522d'
];
const uuidColorMap: any = {};
const maxCols = lineColors.length - 1;

function nextLinePaintStyle(uuid: any) {
  return uuidColorMap[uuid]
    || (uuidColorMap[uuid] = Object.assign({}, linePaintDefault, { strokeStyle: lineColors[lineCount++ % maxCols] }));
}

const instanceTemplate = {
  Connector: ['Bezier', { curviness: 70 }],
  HoverPaintStyle: {
    lineWidth: 4,
    strokeStyle: '#216477',
    outlineWidth: 2,
    outlineColor: 'white'
  },
  PaintStyle: nextLinePaintStyle('dummy'),
  Container: 'pipelineContainer'
};

export const dataSrcIdPrefix = 'dataSource_';

@Injectable()
export class PlumbGuiService {
  connectionsInitialized = false;

  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  buildInstance(queryDef: any) {
    const instance = jsPlumb.getInstance(instanceTemplate);

    // If connection on Out-DataSource was removed, remove custom Endpoint
    instance.bind('connectionDetached', (info: any) => {
      if (info.targetId === dataSrcIdPrefix + 'Out') {
        const element = info.target;
        const fixedEndpoints = this.findDataSourceOfElement(element, queryDef).dataSource.Definition().In;
        const label = info.targetEndpoint.getOverlay('endpointLabel').label;
        if (fixedEndpoints.indexOf(label) === -1) {
          setTimeout(() => { instance.deleteEndpoint(info.targetEndpoint); }, 0);
        }
      }
    });

    instance.bind('connection', (info: any) => {
      if (!this.connectionsInitialized) { return; }

      const endpointLabel = info.targetEndpoint.getOverlay('endpointLabel');
      const labelPrompt = endpointLabel.getLabel();
      const endpoints = instance.getEndpoints(info.target.id);
      let targetEndpointHavingSameLabel;
      endpoints.forEach((endpoint: any) => {
        const label = endpoint.getOverlay('endpointLabel').getLabel();
        if (label === labelPrompt &&
          info.targetEndpoint.id !== endpoint.id &&
          (endpoint.canvas as HTMLElement).classList.contains('targetEndpoint')) {
          targetEndpointHavingSameLabel = endpoint;
        }
      });
      if (targetEndpointHavingSameLabel) {
        endpointLabel.setLabel(`PleaseRename${Math.floor(Math.random() * 99999)}`);
      }
    });

    return instance;
  }

  // this will retrieve the dataSource info-object for a DOM element
  findDataSourceOfElement(element: HTMLElement, queryDef: any) {
    element = this.fixElementNodeList(element);
    const guid = (element.attributes as any).guid.value;
    const list = queryDef.data.DataSources;
    const found = list.find((el: any) => el.EntityGuid === guid);
    return found;
  }

  initWirings(queryDef: any, instance: any) {
    queryDef.data.Pipeline.StreamWiring?.forEach((wire: any) => {
      // read connections from Pipeline
      const sourceElementId = dataSrcIdPrefix + wire.From;
      const fromUuid = sourceElementId + '_out_' + wire.Out;
      const targetElementId = dataSrcIdPrefix + wire.To;
      const toUuid = targetElementId + '_in_' + wire.In;

      // Ensure In- and Out-Endpoint exist
      if (!instance.getEndpoint(fromUuid)) {
        this.addEndpoint(jsPlumb.getSelector('#' + sourceElementId), wire.Out, false, queryDef, instance);
      }
      if (!instance.getEndpoint(toUuid)) {
        this.addEndpoint(jsPlumb.getSelector('#' + targetElementId), wire.In, true, queryDef, instance);
      }

      try {
        instance.connect({
          uuids: [fromUuid, toUuid],
          paintStyle: nextLinePaintStyle(fromUuid)
        });
      } catch (e) {
        console.error({ message: 'Connection failed', from: fromUuid, to: toUuid });
      }
    });
  }

  // Add a jsPlumb Endpoint to an Element
  addEndpoint(element: HTMLElement, name: any, isIn: any, queryDef: any, instance: any) {
    element = this.fixElementNodeList(element);
    if (!element) {
      console.error({ message: 'Element not found', selector: element });
      return;
    }

    const dataSource = this.findDataSourceOfElement(element, queryDef);

    const uuid = element.id + (isIn ? '_in_' : '_out_') + name;
    const params = {
      uuid,
      enabled:
        !dataSource.ReadOnly ||
        dataSource.EntityGuid === 'Out' // Endpoints on Out-DataSource must be always enabled
    };
    const endPoint = instance.addEndpoint(element,
      (isIn ? this.buildTargetEndpoint(queryDef) : this.buildSourceEndpoint(queryDef)),
      params);
    endPoint.getOverlay('endpointLabel').setLabel(name);
  }

  // the definition of source endpoints (the small blue ones)
  buildSourceEndpoint(queryDef: any) {
    return {
      paintStyle: { fillStyle: 'transparent', radius: 10, lineWidth: 0 },
      cssClass: 'sourceEndpoint',
      maxConnections: -1,
      isSource: true,
      anchor: ['Continuous', { faces: ['top'] }],
      overlays: this.getEndpointOverlays(true, queryDef.readOnly)
    };
  }

  // the definition of target endpoints (will appear when the user drags a connection)
  buildTargetEndpoint(queryDef: any) {
    return {
      paintStyle: { fillStyle: 'transparent', radius: 10, lineWidth: 0 },
      cssClass: 'targetEndpoint',
      maxConnections: 1,
      isTarget: true,
      anchor: ['Continuous', { faces: ['bottom'] }],
      overlays: this.getEndpointOverlays(false, queryDef.readOnly),
      dropOptions: { hoverClass: 'hover', activeClass: 'active' }
    };
  }

  // #region jsPlumb Endpoint Definitions
  getEndpointOverlays(isSource: any, readOnlyMode: any) {
    return [
      [
        'Label', {
          id: 'endpointLabel',
          // location: [0.5, isSource ? -0.5 : 1.5],
          location: [0.5, isSource ? 0 : 1],
          label: 'Default',
          cssClass: 'noselect ' + (isSource ? 'endpointSourceLabel' : 'endpointTargetLabel'),
          events: {
            dblclick: (labelOverlay: any) => {
              if (readOnlyMode) { return; }

              const newLabel = prompt('Rename Stream', labelOverlay.label);
              if (newLabel) {
                labelOverlay.setLabel(newLabel);
              }
            }
          }
        }
      ]
    ];
  }

  makeSource(dataSource: any, element: HTMLElement, dragHandler: any, queryDef: any, instance: any) {
    // suspend drawing and initialise
    element = this.fixElementNodeList(element);
    instance.batch(() => {

      // make DataSources draggable. Must happen before makeSource()!
      if (!queryDef.readOnly) {
        instance.draggable(element,
          {
            grid: [20, 20],
            drag: dragHandler
          });
      }

      // Add Out- and In-Endpoints from Definition
      const dataSourceDefinition = dataSource.Definition();
      if (dataSourceDefinition) {
        // Add Out-Endpoints
        dataSourceDefinition.Out?.forEach((name: any) => {
          this.addEndpoint(element, name, false, queryDef, instance);
        });
        // Add In-Endpoints
        dataSourceDefinition.In?.forEach((name: any) => {
          this.addEndpoint(element, name, true, queryDef, instance);
        });
        // make the DataSource a Target for new Endpoints (if .In is an Array)
        if (dataSourceDefinition.In) {
          const targetEndpointUnlimited = this.buildTargetEndpoint(queryDef);
          targetEndpointUnlimited.maxConnections = -1;
          instance.makeTarget(element, targetEndpointUnlimited);
        }

        if (dataSourceDefinition.DynamicOut) {
          instance.makeSource(element,
            this.buildSourceEndpoint(queryDef),
            { filter: '.add-endpoint .new-connection' });
        }
      }
    });
  }

  pushPlumbConfigToQueryDef(instance: any, queryDef: any) {
    const connectionInfos: any[] = [];
    instance.getAllConnections().forEach((connection: any) => {
      connectionInfos.push({
        From: connection.sourceId.substr(dataSrcIdPrefix.length),
        Out: connection.endpoints[0].getOverlay('endpointLabel').label,
        To: connection.targetId.substr(dataSrcIdPrefix.length),
        In: connection.endpoints[1].getOverlay('endpointLabel').label,
      });
    });
    queryDef.data.Pipeline.StreamWiring = connectionInfos;

    const streamsOut: any[] = [];
    instance.selectEndpoints({ target: dataSrcIdPrefix + 'Out' }).each((endpoint: any) => {
      streamsOut.push(endpoint.getOverlay('endpointLabel').label);
    });
    queryDef.data.Pipeline.StreamsOut = streamsOut.join(',');
  }

  putEntityCountOnConnection(result: any, queryDef: any, instance: any) {
    result.Streams?.forEach((stream: any) => {
      // Find jsPlumb Connection for the current Stream
      const sourceElementId = dataSrcIdPrefix + stream.Source;
      let targetElementId = dataSrcIdPrefix + stream.Target;
      if (stream.Target === '00000000-0000-0000-0000-000000000000'
        || stream.Target === queryDef.data.Pipeline.EntityGuid) {
        targetElementId = dataSrcIdPrefix + 'Out';
      }

      const fromUuid = sourceElementId + '_out_' + stream.SourceOut;
      const toUuid = targetElementId + '_in_' + stream.TargetIn;

      const sEndp = instance.getEndpoint(fromUuid);
      if (sEndp) {
        sEndp.connections?.forEach((connection: any) => {
          if (connection.endpoints[1].getUuid() === toUuid) {
            // when connection found, update it's label with the Entities-Count
            connection.setLabel({
              label: stream.Count.toString(),
              cssClass: 'streamEntitiesCount'
            });
            return;
          }
        });
      }
    });
  }

  /** selectors in jsPlumb return array */
  private fixElementNodeList(element: HTMLElement | NodeList) {
    const el = (element instanceof NodeList ? element[0] : element) as HTMLElement;
    return el;
  }

}
