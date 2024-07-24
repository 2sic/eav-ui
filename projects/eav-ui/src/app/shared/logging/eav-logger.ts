import { logMain } from '../helpers/console-log-angular.helper';
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

  public nameWithSvcId: string;

  inherit(parent: EavLogger) {
    this.enabled = this.enabled || parent.enabled;

    // if this results in log enabled, inform the console.
    // otherwise it's really hard to find out why a log is on
    if (parent.enabled)
      this.a(`Enabled: Inheriting log settings from parent ${parent.nameWithSvcId}`);
  }

  /**
   * Special 'a' = add log helper to better diagnose what is happening
   */
  a(message: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return;
    logMain(`[${this.nameWithSvcId}] ${message}`, data);
  }

  /** Create a special logger for rx logging */
  rxTap(name: string, { enabled = true, jsonify = true }: { enabled?: boolean; jsonify?: boolean; } = { enabled: true, jsonify: true }) {
    return new RxTapDebug(this, name, enabled, jsonify);
  }

  val(name: string, value: unknown) {
    if (!this.enabled) return;
    logMain(`[${this.nameWithSvcId}] value of ${name}:`, { value });
  }

  values(data: Record<string, unknown>) {
    if (!this.enabled) return;
    logMain(`[${this.nameWithSvcId}] values:`, data);
  }

  fn(name: string, data?: Record<string, unknown>, message?: string): EavLoggerFn {
    return new EavLoggerFn(this, name, message, data);
  }

  /**
   * Create a logger function that will only log if the condition is true
   */
  fnCond(condition: boolean, name: string, data?: Record<string, unknown>, message?: string): EavLoggerFn {
    // create real logger if condition is true, or if this logger is disabled anyhow
    return condition || !this.enabled
      ? this.fn(name, data, message)
      : new EavLogger('noop', false).fn('noop', { condition });
  }
}
