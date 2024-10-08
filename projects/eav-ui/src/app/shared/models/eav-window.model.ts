import type { SxcGlobal } from '@2sic.com/2sxc-typings';
import type { TinyMCE } from 'tinymce';

export type RequirejsType = any;

interface EavWindowProps {
  contextId: number;
  /** requirejs */
  define: RequirejsType;
  draggingClass: string;
  // 2024-10-08 2dm removed since it causes dependencies on fieldLogicManager for anything that uses the EavWindow
  // eavFieldLogicManager: FieldLogicManager;
  // 2024-10-08 2dm removed since it causes dependencies on jsPlumb for anything that uses the EavWindow
  // jsPlumb: PlumbType;
  parent: Window & {
    $2sxc: {
      totalPopup: {
        close(): void;
      };
    };
  };
  /** requirejs */
  require: RequirejsType;
  /** requirejs */
  requirejs: RequirejsType;
  sxcVersion: string;
  tinymce: TinyMCE;
  windowBodyTimeouts: number[];
  $2sxc: SxcGlobal;
  _jsApi: {};
}

export type EavWindow = typeof window & EavWindowProps;
