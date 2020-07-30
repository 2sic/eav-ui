import { Observable } from 'rxjs';

import { ConnectorData } from './ConnectorData';
import { FieldConfig } from './FieldConfig';
import { ExperimentalProps } from './ExperimentalProps';
import { ConnectorDialog } from './ConnectorDialog';

export interface Connector<T> {

  /** Current field configuration */
  field: FieldConfig;

  /** Observable on field configuration */
  field$: Observable<FieldConfig>;

  /** Current field data, read/write or get other languages */
  data: ConnectorData<T>;

  /** Communicates with the dialog */
  dialog: ConnectorDialog<T>;

  /**
   * Load a script into the browser - but only once.
   * Makes sure that script with the same source is loaded only once and executes callback.
   *
   * @param {string | () => boolean} test - name on window.xxx which is checked if the js is already loaded or function that returns a boolean
   * @param {string} src - path to the script
   * @param {() => any} callback - your callback function
   * @memberof Connector
   */
  loadScript(test: string | (() => boolean), src: string, callback: () => any): void;

  /**
   * Load multiple scripts into the browser - but only once.
   * Makes sure that script with the same source is loaded only once and executes callback.
   *
   * @param {{ test: string | (() => boolean); src: string }[]} scripts - multiple scripts with test and src
   * @param {() => any} callback - your callback function
   * @memberof Connector
   */
  loadScript(scripts: { test: string | (() => boolean); src: string }[], callback: () => any): void;

  /** Data not yet standardized */
  _experimental: ExperimentalProps;
}
