

export interface WysiwygReconfigure {

  initManager?(editorManager: any): void;

  initPlugins?(plugins: string[]): string[];

  initOptions?(options: any): any;
}
