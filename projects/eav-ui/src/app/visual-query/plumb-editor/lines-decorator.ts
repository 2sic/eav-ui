import { classLog } from '../../../../../shared/logging';
import { QueryResult } from '../models/result/pipeline-result';
import { QueryStreamResult } from '../models/result/PipelineResultStream';
import { VisualQueryModel } from '../models/visual-query.model';
import { JsPlumbEndpoint, JsPlumbInstance } from './jsplumb.models';
import { domIdOfGuid } from './plumber-constants';

const logSpecs = {
  all: false,
  putEntityCountOnConnections: false,
}

export class LinesDecorator {
  log = classLog({LinesDecorator}, logSpecs);

  constructor(
    private instance: JsPlumbInstance, 
    private pipelineModel: VisualQueryModel,
    private onDebugStream: (stream: QueryStreamResult) => void,
  ) { }
  
  /**
   * Updates the entity count on each connections based on the provided result.
   * @param result PipelineResult
   */
  addEntityCount(result: QueryResult) {
    const l = this.log.fnIf('putEntityCountOnConnections');
    result.Streams?.forEach(stream => {
      const outDomId = domIdOfGuid(stream.Source);
      const outTargets = ['00000000-0000-0000-0000-000000000000', this.pipelineModel.Pipeline.EntityGuid];
      const inDomId = outTargets.includes(stream.Target)
        ? domIdOfGuid('Out')
        : domIdOfGuid(stream.Target);

      const fromUuid = outDomId + '_out_' + stream.SourceOut;
      const toUuid = inDomId + '_in_' + stream.TargetIn;

      const endpoint: JsPlumbEndpoint = this.instance.getEndpoint(fromUuid);
      endpoint?.connections
        ?.filter((connection) => connection.endpoints[1].getUuid() === toUuid)
        ?.forEach((connection) => {
          const label = !stream.Error ? stream.Count.toString() : '';
          const cssClass = 'streamEntitiesCount ' + (!stream.Error ? '' : 'streamEntitiesError');
          connection.setLabel({
            label,
            cssClass,
            events: {
              click: () => {
                if (!this.pipelineModel.Pipeline.AllowEdit)
                  return;
                this.onDebugStream(stream);
              },
            },
          });
        });
    });
    l.end('done');
  }
}