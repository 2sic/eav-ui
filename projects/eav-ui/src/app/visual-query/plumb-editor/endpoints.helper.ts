import { classLog } from '../../shared/logging';
import { EndpointInfo, PlumbType } from './plumb-editor.models';
import { Plumber } from './plumber.helper';

const logSpecs = {
  all: true,
  getEndpointOverlays: true,
  getEndpointInfo: true,
  buildSourceEndpoint: true,
  buildTargetEndpoint: true,
}

export class EndpointsHelper {
  
  log = classLog({EndpointsHelper}, logSpecs, true);

  constructor(private plumb: Plumber) { }

  private getEndpointOverlays(isSource: boolean) {
    const l = this.log.fnIf('getEndpointOverlays', {isSource});
    const result = [
      [
        'Label', {
          id: 'endpointLabel',
          location: [0.5, isSource ? 0 : 1],
          label: 'Default',
          cssClass: isSource ? 'endpointSourceLabel' : 'endpointTargetLabel',
        },
      ],
    ];
    return l.r(result);
  }

  getEndpointInfo(endpointName: string, isDynamic: boolean): EndpointInfo {
    const l = this.log.fnIf('getEndpointInfo', {endpointName, isDynamic});
    let name: string;
    let required: boolean;

    const trimmed = endpointName.trim();
    required = trimmed.endsWith('*');
    name = !required ? trimmed : trimmed.substring(0, trimmed.length - 1);

    if (isDynamic)
      return l.r({
        name,
        required: false
      } satisfies EndpointInfo, 'isDynamic');
    
    return l.r({ name, required } satisfies EndpointInfo, 'notDynamic');
  }

  buildSourceEndpoint(pipelineDataSourceGuid: string, style?: string) {
    const l = this.log.fnIf('buildSourceEndpoint', {pipelineDataSourceGuid, style});
    const isSource = true;
    const sourceEndpoint = {
      paintStyle: { fill: 'transparent', radius: 10 },
      cssClass: 'sourceEndpoint ' + style ?? '',
      maxConnections: -1,
      isSource,
      anchor: ['Continuous', { faces: ['top'] }],
      overlays: this.getEndpointOverlays(isSource),
      events: {
        click: (endpointOrOverlay: PlumbType) => this.plumb.onChangeLabel(endpointOrOverlay, isSource, pipelineDataSourceGuid),
      },
    };
    return l.r(sourceEndpoint);
  }

  buildTargetEndpoint(pipelineDataSourceGuid: string, style?: string) {
    const l = this.log.fnIf('buildTargetEndpoint', {pipelineDataSourceGuid, style});
    const isSource = false;
    const targetEndpoint = {
      paintStyle: { fill: 'transparent', radius: 10 },
      cssClass: 'targetEndpoint ' + (style ?? ' '), // + (angled ? 'angled' : ''),
      maxConnections: 1,
      isTarget: !isSource,
      anchor: ['Continuous', { faces: ['bottom'] }],
      overlays: this.getEndpointOverlays(isSource),
      dropOptions: { hoverClass: 'hover', activeClass: 'active' },
      events: {
        click: (endpointOrOverlay: PlumbType) => this.plumb.onChangeLabel(endpointOrOverlay, isSource, pipelineDataSourceGuid),
      },
    };
    return l.r(targetEndpoint);
  }
}