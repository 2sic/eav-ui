import { IAdamModeConfig } from "./IAdamModeConfig";

export interface IAdamConfig {
  adamModeConfig: IAdamModeConfig;
  allowAssetsInRoot: boolean;
  autoLoad: boolean;
  enableSelect: boolean;
  fileFilter: string;
  folderDepth: number;
  metadataContentTypes: string;
  showImagesOnly: boolean;
  subFolder: string;
}
