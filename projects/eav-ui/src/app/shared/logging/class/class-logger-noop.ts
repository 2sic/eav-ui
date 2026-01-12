import { FnLoggerNoOp } from '../fn/fn-logger-noop';
import { FnLogger } from '../fn/fn-logger.interface';
import { RxTapDebug } from '../rx-debug-dbg';
import { BooleanKeys, ClassLogger, RecordOrGenerator, StringArrayKeys } from './class-logger';

export class ClassLoggerNoop<TSpecs extends unknown = any> implements ClassLogger<TSpecs> {
  constructor(specs: TSpecs) {
    this.specs = specs ?? {} as TSpecs;
  }
  svcId = 'noop';
  name = 'noop';
  get enabled() { return false; }
  enableChildren = false;
  specs: TSpecs;

  extendName(addOn: string): this { return this; }

  nameWithSvcId: string;

  inherit(parent: ClassLogger<any>): void { }

  forceEnable(enabled: boolean | null): void { }

  a(message: string, data?: RecordOrGenerator): void { }

  aIfInList(list: StringArrayKeys<TSpecs>, subKey: string, data?: RecordOrGenerator, message?: string): void { }
  
  aIf(key: BooleanKeys<TSpecs> & string, data?: RecordOrGenerator, message?: string): void { }

  rxTap(name: string, options?: { enabled?: boolean; jsonify?: boolean; }): RxTapDebug {
    return new RxTapDebug(this as ClassLogger, 'noop');
  }
  
  fn(name: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return new FnLoggerNoOp();
  }
  
  fnCond(condition: boolean, name: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return new FnLoggerNoOp();
  }
  
  fnIf(key: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return new FnLoggerNoOp();
  }

  fnIfInList(key: BooleanKeys<TSpecs> & string, list: StringArrayKeys<TSpecs>, value: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return new FnLoggerNoOp();
  }

  fnIfInFields(key: BooleanKeys<TSpecs> & string, fieldName: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return new FnLoggerNoOp();
  }

}