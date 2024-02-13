import { consoleLogAlways } from '../helpers/console-log-angular.helper';

export class EavLogger {
  /** Special random ID to identify a specific service and detect reuse or separate instances  */
  svcId = Math.random().toString(36).substring(7);

  constructor(public name: string, public enabled: boolean) { 

  }

  /** Special 'a' = add log helper to better diagnose what is happening */
  add(message: string, ...args: any[]): void {
    if (!this.enabled) return;
    consoleLogAlways(`[${this.name}-${this.svcId}] ${message}`, ...args);
  }

  qAdd(): (message: string, ...args: any[]) => void {
    return this.add.bind(this);
  }
}