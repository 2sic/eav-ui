import type { SxcGlobal } from '@2sic.com/2sxc-typings';

interface EavWindowProps {
  contextId: number;
  draggingClass: string;
  // 2024-10-08 2dm removed since it causes dependencies on jsPlumb for anything that uses the EavWindow
  // jsPlumb: PlumbType;
  parent: Window & {
    $2sxc: {
      totalPopup: {
        close(): void;
      };
    };
  };
  /** requirejs - only used by theload-scripts.helper.ts */
  require: any;
  sxcVersion: string;
  windowBodyTimeouts: number[];
  $2sxc: SxcGlobal;
  _jsApi: {};
}

export type EavWindow = typeof window & EavWindowProps;
