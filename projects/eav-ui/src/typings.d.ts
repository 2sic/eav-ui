/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const contents: string;
  export default contents;
}

declare module '*.rawts' {
  const contents: string;
  export default contents;
}

declare module '*.png' {
  const urlLoaderContents: string;
  export default urlLoaderContents;
}
