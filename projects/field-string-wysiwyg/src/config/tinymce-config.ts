import { WysiwygMode, WysiwygView } from './tinymce-helper-types';


interface TinyMceButtonsConfig {
  source: boolean;
  advanced: boolean;
  contentDivisions: boolean;
}
export interface TinyMceModeConfig {
  features: {
    contentBlocks: boolean,
    richContent: boolean,
  };

  buttons: Record<WysiwygView, TinyMceButtonsConfig>
}

export const DefaultTinyMceModeConfig: TinyMceModeConfig = {
  features: {
    contentBlocks: false,
    richContent: true, // temporary, as we are still in dev. will be false later on
  },
  buttons: {
    inline:   {
      source: false,
      advanced: false,
      contentDivisions: true  // temporary, as we are still in dev. will be false later on
    },
    dialog:   {
      source: true,
      advanced: true,
      contentDivisions: true  // temporary, as we are still in dev. will be false later on
    }  
  }

}

// This is stil WIP for 2dm - would be the JSON that comes from the field configuration
export interface TinyMceModeConfigJson extends TinyMceModeConfig {
  /** The foundation for filling in the configuration */
  inherits?: WysiwygMode;
  contextmenu?: string;
  toolbar?: string | string[]
}


/**
 * Goal is to have a class which contains all the settings
 * which affect how the toolbars etc. are made.
 * 
 * This is so that we can place our default values here, 
 * but then allow field configuration to replace it.
 * 
 * ...but still just pass one object to all the helper functions,
 * ...and keep things simple as more configs are added.
 */
export type TinyMceConfigJson = Record<WysiwygMode, TinyMceModeConfigJson>;
