import { classLog } from '../../shared/logging';
import { PipelineModel } from '../models/pipeline.model';
import { EndpointLabelRenameParts } from './endpoint-label-rename.model';
import { JsPlumbEndpoint, JsPlumbOverlay } from './jsplumb.models';
import { EndpointInfo } from './plumb-editor.models';
import { RenameStreamComponent } from './rename-stream/rename-stream';
import { RenameStreamDialogData } from './rename-stream/rename-stream.models';

const logSpecs = {
  all: true,
  getEndpointOverlays: true,
  getEndpointInfo: true,
  buildSourceDef: true,
  buildTargetDef: true,
}

/**
 * Trivial helper to get endpoint definitions and similar things
 */
export class EndpointDefinitionsService {

  log = classLog({EndpointDefinitionsService}, logSpecs);

  constructor(
    private pipelineModel: PipelineModel,
    private renameDialogParts: EndpointLabelRenameParts,
  ) { }

  #getEndpointOverlays(isSource: boolean) {
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

  getInfo(endpointName: string, isDynamic: boolean): EndpointInfo {
    const l = this.log.fnIf('getEndpointInfo', {endpointName, isDynamic});
    // let name: string;
    // let required: boolean;

    // Trim name and see if it's required - marked with a trailing '*'
    const trimmed = endpointName.trim();
    const required = trimmed.endsWith('*');
    const name = !required
      ? trimmed
      : trimmed.substring(0, trimmed.length - 1);

    if (isDynamic)
      return l.r({
        name,
        required: false
      } satisfies EndpointInfo, 'isDynamic');

    return l.r({ name, required } satisfies EndpointInfo, 'notDynamic');
  }

  buildSourceDef(dsGuid: string, style?: string) {
    const l = this.log.fnIf('buildSourceDef', {pipelineDataSourceGuid: dsGuid, style});
    const isSource = true;
    const sourceEndpoint = {
      paintStyle: { fill: 'transparent', radius: 10 },
      cssClass: 'sourceEndpoint ' + (style ?? ''),
      maxConnections: -1,
      isSource,
      anchor: ['Continuous', { faces: ['top'] }],
      overlays: this.#getEndpointOverlays(isSource),
      events: {
        click: (endpointOrOverlay: JsPlumbOverlay) => this.onChangeLabel(endpointOrOverlay, isSource, dsGuid),
      },
    };
    return l.r(sourceEndpoint);
  }

  buildTargetDef(dsGuid: string, style?: string) {
    const l = this.log.fnIf('buildTargetDef', {pipelineDataSourceGuid: dsGuid, style});
    const isSource = false;
    const targetEndpoint = {
      paintStyle: { fill: 'transparent', radius: 10 },
      cssClass: 'targetEndpoint ' + (style ?? ' '), // + (angled ? 'angled' : ''),
      maxConnections: 1,
      isTarget: !isSource,
      anchor: ['Continuous', { faces: ['bottom'] }],
      overlays: this.#getEndpointOverlays(isSource),
      dropOptions: { hoverClass: 'hover', activeClass: 'active' },
      events: {
        click: (endpointOrOverlay: JsPlumbOverlay) => this.onChangeLabel(endpointOrOverlay, isSource, dsGuid),
      },
    };
    return l.r(targetEndpoint);
  }


  onChangeLabel(endpointOrOverlay: JsPlumbEndpoint | JsPlumbOverlay, isSource: boolean, pipelineDataSourceGuid: string) {
    if (!this.pipelineModel.Pipeline.AllowEdit)
      return;

    debugger;
    const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint)?.getOverlay?.('endpointLabel')
      ?? endpointOrOverlay as JsPlumbOverlay;

    this.renameDialogParts.matDialog
      .open(RenameStreamComponent, {
        autoFocus: false,
        data: {
          pipelineDataSourceGuid,
          isSource,
          label: overlay.label,
        } satisfies RenameStreamDialogData,
        viewContainerRef: this.renameDialogParts.viewContainerRef,
        width: '650px',
      })
      .afterClosed().subscribe(newLabel => {
        if (!newLabel)
          return;
        overlay.setLabel(newLabel);
        setTimeout(() => this.renameDialogParts.onConnectionsChanged());
      });

    this.renameDialogParts.changeDetectorRef.markForCheck();
  }


  // public onChangeLabel(endpointOrOverlay: JsPlumbEndpoint | JsPlumbOverlay, isSource: boolean, pipelineDataSourceGuid: string) {
  //   if (!this.pipelineModel.Pipeline.AllowEdit)
  //     return;

  //   const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint)?.getOverlay('endpointLabel')
  //     ?? endpointOrOverlay as JsPlumbOverlay;

  //   this.matDialog
  //     .open(RenameStreamComponent, {
  //       autoFocus: false,
  //       data: {
  //         pipelineDataSourceGuid,
  //         isSource,
  //         label: overlay.label,
  //       } satisfies RenameStreamDialogData,
  //       viewContainerRef: this.viewContainerRef,
  //       width: '650px',
  //     })
  //     .afterClosed().subscribe(newLabel => {
  //       if (!newLabel)
  //         return;
  //       overlay.setLabel(newLabel);
  //       setTimeout(() => this.onConnectionsChanged());
  //     });

  //   this.changeDetectorRef.markForCheck();
  // }

}
