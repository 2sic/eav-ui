declare module "*.html" {
  const html: string;
  export default html;
}

declare module "*.css" {
  const css: string;
  export default css;
}

declare module "*.svg" {
  const svg: string;
  export default svg;
}

declare module "*.scss" {
  const scss: string;
  export default scss;
}

/**
 * This is so we can import formula typings which we edit like a .ts file
 * into the system as a string for giving to Monaco
 */
declare module "*.rawts" {
  const content: string;
  export default content;
}