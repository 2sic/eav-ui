import { Signal } from '@angular/core';
import { Reactive, ReactiveNode, SIGNAL } from '@angular/core/primitives/signals';

export class ComputedAnalyzer<T> {
  constructor(private computed: Signal<T>) {
  }

  getConsumerNode() {
    const forDebug = this.computed as Reactive;
    const node = forDebug[SIGNAL] as ConsumerNode;
    return node;
  }

  getProducers() {
    const producers = this.getConsumerNode().producerNode;
    return producers;
  }

  getDirtyProducers() {
    const node = this.getConsumerNode();
    const producers = node.producerNode;
    return producers;
  }

  snapShotProducers(onlyDirty: boolean = false) {
    return this.#getSubInfosOf(this.getConsumerNode(), onlyDirty);
  }

  #getSubInfosOf(producer: ReactiveNode, filterDirty: boolean) {
    return this.#getSubProducers(producer.producerNode, producer.producerLastReadVersion, filterDirty);
  }


  #getSubProducers(subProducers: ReactiveNode[], producerVersions: number[], filterDirty: boolean): ProducerState[] {
    if (!subProducers) return [];

    let subInfos = subProducers
      .map((producer, idx) => {
        const dirtyPrd = producer.dirty;
        const verOwn = producerVersions[idx];
        const verPrd = producer.version;
        const dirtyVer = verOwn < verPrd;
        const subInfos = this.#getSubInfosOf(producer, filterDirty);
        const dirtySub = subInfos.some(d => d.dirty);
        const dirty = dirtyPrd || dirtyVer || dirtySub;
        const dirtyDepth = subInfos.find(d => d.dirty)?.dirtyDepth + 1 || (dirty ? 1 : 0);
        return {
          name: (producer as any)?.debugName || 'unknown',
          idx,
          dirty,
          dirtyDepth,
          dirtyPrd,
          dirtyVer,
          dirtySub,
          verOwn,
          verPrd,
          producer,
          subInfos,
        } as ProducerState;
      });

    if (filterDirty)
      subInfos = subInfos.filter(d => d.dirty);
    return subInfos;
  }
}

interface ProducerState {
  idx: number;
  name: string;
  dirty: boolean;
  dirtyDepth: number;
  dirtyVer: boolean;
  dirtyPrd: boolean;
  dirtySub: boolean;
  verOwn: number;
  verPrd: number;
  producer: ReactiveNode;
  subInfos: ProducerState[];
}

// interface ProducerSnapshot {
//   idx: number;
//   name: string;
//   ver: number;
//   val: unknown;
//   dirty: boolean;
//   dirtyPrd: boolean;
//   dirtySub: boolean;
//   subInfos: ProducerState[];
//   producer: ReactiveNode;
// }

// https://github.com/angular/angular/blob/main/packages/core/primitives/signals/src/graph.ts#L184C1-L188C2
interface ConsumerNode extends ReactiveNode {
  producerNode: NonNullable<ReactiveNode['producerNode']>;
  producerIndexOfThis: NonNullable<ReactiveNode['producerIndexOfThis']>;
  producerLastReadVersion: NonNullable<ReactiveNode['producerLastReadVersion']>;
}