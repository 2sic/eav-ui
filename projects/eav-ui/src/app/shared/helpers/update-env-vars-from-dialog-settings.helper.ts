import { EnvironmentSpecs } from '@2sic.com/2sxc-typings';
import { DialogContextApp } from '../models/dialog-context.models';
import { EavWindow } from '../models/eav-window.model';

declare const window: EavWindow;

/**
 * This ensures that $2sxc is fully initialized with parameters which are provided later on
 * The appApi is being added in v12
 * It's important because in Oqtane the app-api root is different in from the normal admin-apis
 */
export function UpdateEnvVarsFromDialogSettings(appContext: DialogContextApp): void {
  try {
    const includedApiRoot = appContext?.Api;
    if (!includedApiRoot) { return; }

    const old2sxcHeader = (window.$2sxc.env as any).header as EnvironmentSpecs;
    const new2sxcHeader = { ...old2sxcHeader, appApi: includedApiRoot } as EnvironmentSpecs;
    window.$2sxc.env.load(new2sxcHeader);
  } catch { /* ignore */ }
}
