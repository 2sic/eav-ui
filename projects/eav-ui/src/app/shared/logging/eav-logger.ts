import { consoleLogAlways, logAlways } from '../helpers/console-log-angular.helper';
import { EavLoggerFn } from './eav-logger-fn';
import { RxTapDebug } from './rx-debug-dbg';

export class EavLogger {
  /** Special random ID to identify a specific service and detect reuse or separate instances  */
  svcId = Math.random().toString(36).substring(7);

  enableChildren: boolean;

  constructor(public name: string, public enabled: boolean, enableChildren?: boolean) { 
    this.enableChildren = enableChildren ?? false;
    this.nameWithSvcId = `${name}-${this.svcId}`;
  }

  public rename(name: string) {
    this.name = name;
    this.nameWithSvcId = `${name}-${this.svcId}`;
  }

  private nameWithSvcId: string;

  inherit(parent: EavLogger) {
    this.enabled = this.enabled || parent.enabled;

    // if this results in log enabled, inform the console.
    // otherwise it's really hard to find out why a log is on
    if (parent.enabled)
      this.a(`Enabled: Inheriting log settings from parent ${parent.nameWithSvcId}`);
  }

  /**
   * Quick log, without the call stack
   * @param message message to show
   * @param args data to show
   * @returns 
   */
  a(message: string, data?: unknown[]): void {
    if (!this.enabled) return;
    logAlways(`[${this.nameWithSvcId}] ${message}`, data);
  }

  /**
   * Special 'a' = add log helper to better diagnose what is happening
   */
  add(message: string, ...args: any[]): void {
    if (!this.enabled) return;
    consoleLogAlways(`[${this.nameWithSvcId}] ${message}`, ...args);
  }

  qAdd(): (message: string, ...args: any[]) => void {
    return this.add.bind(this);
  }

  /** Create a special logger for rx logging */
  rxTap(name: string, { enabled = true, jsonify = true }: { enabled?: boolean; jsonify?: boolean; } = { enabled: true, jsonify: true }) {
    return new RxTapDebug(this, name, enabled, jsonify);
  }

  val(name: string, value: unknown) {
    if (!this.enabled) return;
    logAlways(`[${this.nameWithSvcId}] value of ${name}:`, [value]);
  }

  fn(name: string, message?: string, data?: Record<string, unknown>): EavLoggerFn {
    return new EavLoggerFn(this, name, message, data);
  }
}