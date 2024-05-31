import { consoleLogAlways, logAlways } from '../helpers/console-log-angular.helper';
import { RxTapDebug } from './rx-debug-dbg';

export class EavLogger {
  /** Special random ID to identify a specific service and detect reuse or separate instances  */
  svcId = Math.random().toString(36).substring(7);

  enableChildren: boolean;

  constructor(public name: string, public enabled: boolean, enableChildren?: boolean) { 
    this.enableChildren = enableChildren /* ?? enabled */ ?? false;
  }

  inherit(log: EavLogger) {
    this.enabled = log.enabled;
  }

  /**
   * Quick log, without the call stack
   * @param message message to show
   * @param args data to show
   * @returns 
   */
  a(message: string, ...args: any[]): void {
    if (!this.enabled) return;
    logAlways(`[${this.name}-${this.svcId}] ${message}`, ...args);
  }

  /**
   * Special 'a' = add log helper to better diagnose what is happening
   */
  add(message: string, ...args: any[]): void {
    if (!this.enabled) return;
    consoleLogAlways(`[${this.name}-${this.svcId}] ${message}`, ...args);
  }

  qAdd(): (message: string, ...args: any[]) => void {
    return this.add.bind(this);
  }

  rxTap(name: string, { enabled = true, jsonify = true }: { enabled?: boolean; jsonify?: boolean; } = { enabled: true, jsonify: true }) {
    return new RxTapDebug(this, name, enabled, jsonify);
  }
}