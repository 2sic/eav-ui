import { classLogEnabled } from '../../../../../../shared/logging';
import { VisualQueryModel } from '../../models/visual-query.model';
import { JsPlumbEndpoint, JsPlumbOverlay } from '../jsplumb.models';
import { EndpointInfo } from '../plumb-editor.models';
import { EndpointLabelName } from '../plumber-constants';
import { RenameStreamComponent } from '../rename-stream/rename-stream';
import { RenameStreamDialogData } from '../rename-stream/rename-stream.models';
import { EndpointLabelRenameParts } from './endpoint-label-rename.model';

const logSpecs = {
  all: false,
  getEndpointOverlays: false,
  getInfo: true,
  buildSourceDef: false,
  buildTargetDef: false,
}

/**
 * Trivial helper to get endpoint definitions and similar things
 */
export class EndpointDefinitionsHelper {

  log = classLogEnabled({EndpointDefinitionsHelper}, logSpecs);

  constructor(
    private pipelineModel: VisualQueryModel,
    private renameDialogParts: EndpointLabelRenameParts,
  ) { }

  #getEndpointOverlays(isSource: boolean) {
    const l = this.log.fnIf('getEndpointOverlays', {isSource});
    const result = [
      [
        'Label', {
          id: EndpointLabelName,
          location: [0.5, isSource ? 0 : 1],
          label: 'Default',
          cssClass: isSource ? 'endpointSourceLabel' : 'endpointTargetLabel',
        },
      ],
    ];
    return l.r(result);
  }

  getInfo(endpointName: string, isDynamic: boolean, customLabel?: string): EndpointInfo {
    const l = this.log.fnIf('getInfo', {endpointName, isDynamic});

    // Trim name and see if it's required - marked with a trailing '*'
    const trimmed = endpointName.trim();
    const isAsterisk = trimmed === '*';
    const required = !isAsterisk && trimmed.endsWith('*');
    const name = !required
      ? trimmed
      : trimmed.substring(0, trimmed.length - 1);

    const label = customLabel ?? (isAsterisk ? '*' : name);

    if (isDynamic)
      return l.r({
        name,
        required: false,
        label,
      } satisfies EndpointInfo, 'isDynamic');

    return l.r({ name, required, label } satisfies EndpointInfo, 'notDynamic');
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
    const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint)?.getOverlay?.(EndpointLabelName)
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

  //   const overlay: JsPlumbOverlay = (endpointOrOverlay as JsPlumbEndpoint)?.getOverlay(EndpointLabelName)
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
