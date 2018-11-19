/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

/**
 * We need this for import json file in code
 */
declare module "*.json" {
  const value: any;
  export default value;
}


