// Window retyped for visual query

import { PlumbType } from './plumb-editor/plumb-editor.models';

interface EavWindowProps {
  jsPlumb: PlumbType;
}

export type WindowWithJsPlumb = typeof window & EavWindowProps;