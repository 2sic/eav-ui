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

// IMPORTANT: THE FOLLOWING PART shouldn't be in custom-gps
// BUt ATM it seems that there are dependencies 
// resulting in loading all the shared files from edit-form
// so gps won't build unless it knows how to handle rawts.
//
// TODO: place formulas stuff in another folder, not it global shared
// and then try to remove this

/**
 * This is so we can import formula typings which we edit like a .ts file
 * into the system as a string for giving to Monaco
 */
declare module "*.rawts" {
  const content: string;
  export default content;
}