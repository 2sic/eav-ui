import { SxcRoot } from '@2sic.com/2sxc-typings';
import { TinyMCE } from 'tinymce';
import { FieldLogicManager } from '../../../../../edit/form/shared/field-logic/field-logic-manager';
import { PlumbType } from '../../visual-query/plumb-editor/plumb-editor.models';
import { RequirejsType } from './requirejs.models';

interface EavWindowProps {
  contextId: number;
  /** requirejs */
  define: RequirejsType;
  draggingClass: string;
  eavFieldLogicManager: FieldLogicManager;
  jsPlumb: PlumbType;
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
  $2sxc: SxcRoot;
  _jsApi: {};
}

export type EavWindow = typeof window & EavWindowProps;
