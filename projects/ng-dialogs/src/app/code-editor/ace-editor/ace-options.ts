import { EditorOptions } from './ace.model';

export const aceOptions: Partial<EditorOptions> & EditorPluginsOptions = {
  mode: 'ace/mode/razor',
  wrap: true,
  useSoftTabs: true,
  theme: 'ace/theme/sqlserver',
  fontSize: 14,
  fontFamily: 'Consolas, Courier New, monospace',
  showGutter: true,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
};

interface EditorPluginsOptions {
  enableBasicAutocompletion: boolean;
  enableLiveAutocompletion: boolean;
  enableSnippets: boolean;
}
