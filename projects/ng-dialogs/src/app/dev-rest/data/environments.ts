import { SelectorData } from './selector-data';

export interface EnvironmentSelectorData extends SelectorData {
  rootPath: string;
}

export const Environments: Array<EnvironmentSelectorData> = [
  {
    key: 'dnn7',
    name: 'DNN 7 or higher',
    rootPath: '/desktopmodules/2sxc/api/',
    description: 'DNN 7 had a longer API-root path, which still works in later versions of DNN',
  },
  {
    key: 'dnn8',
    name: 'DNN 8 or higher',
    rootPath: '/api/2sxc/',
    description: 'DNN 8+ has a shorter root path, with doesn\'t work in DNN 7',
  },
];
