/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.svg" {
  const src: string;
  // @ts-ignore - @2pp: throws error because wysiwyg also declares this module
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.rawts" {
  const src: string;
  // @ts-ignore - @2pp: throws error because wysiwyg also declares this module
  export default src;
}

// @2pp - 2025-12-23: removed as of new angular loader

// declare module '*' {
//   const contents: string;
//   export default contents;
// }

// declare module '*' {
//   const urlLoaderContents: string;
//   export default urlLoaderContents;
// }
