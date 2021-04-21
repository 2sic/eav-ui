import { SxcRoot } from '@2sic.com/2sxc-typings';
import { TinyMCE } from 'tinymce';
import { FieldLogicManager } from '../../../../../edit/field-logic/field-logic-manager';
import { Ace } from '../../code-editor/ace-editor/ace.model';
import { PlumbType } from '../../visual-query/plumb-editor/plumb-editor.models';
import { Dictionary } from './dictionary.model';

interface EavWindowProps {
  ace: Ace;
  contextId: number;
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
  sxcVersion: string;
  tinymce: TinyMCE;
  windowBodyTimeouts: number[];
  $2sxc: SxcRoot;
  _jsApi: {};
}

export type EavWindow = typeof window & EavWindowProps;

export type WindowObject = typeof window & Dictionary;
