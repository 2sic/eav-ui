import { RxHelpers } from "../shared/rxJs/rx.helpers";
import { ViewInfo, ViewKey } from "./code-editor.models";
import { FileAsset } from "./models/file-asset.model";
import { Snippet, SnippetsSets } from "./models/snippet.model";
import { SourceView } from "./models/source-view.model";
import { Tooltip } from "./models/tooltip.model";

/**
 * Helper class providing utility methods for managing code editor views.
 * Contains stateless methods for updating and processing view information.
 */
export class CodeEditorHelper {
    /**
     * Updates a single ViewInfo in a list of ViewInfos.
     * If the ViewInfo with the given viewKey exists, it updates it with the provided data.
     * If it doesn't exist, it adds a new ViewInfo to the list.
     * @returns A new array with the updated ViewInfo
     */
    static updateSingleViewInfo(currentViewInfos: ViewInfo[], viewKey: ViewKey, updates: Partial<ViewInfo> = {}): ViewInfo[] {
        const index = currentViewInfos.findIndex(v => RxHelpers.objectsEqual(v.viewKey, viewKey));

        // If the viewKey is not found, add a new ViewInfo
        if (index < 0)
            return [...currentViewInfos, { viewKey, ...updates }];

        // Otherwise update the existing ViewInfo
        const updatedViewInfo = { ...currentViewInfos[index], ...updates };
        return [
            ...currentViewInfos.slice(0, index),
            updatedViewInfo,
            ...currentViewInfos.slice(index + 1)
        ];
    }

    /**
     * Processes a loaded view and updates its ViewInfo with the loaded data.
     * Also triggers warning callbacks for the processed view.
     * @returns A new array with the updated ViewInfo
     */
    static processLoadedView(
        viewInfos: ViewInfo[],
        viewKey: ViewKey,
        view: SourceView,
        snippets: { list: Snippet[]; sets: SnippetsSets; },
        tooltips: Tooltip[],
        showWarningsCallback: (viewKey: ViewKey, view: SourceView, templates: FileAsset[]) => void,
        templates: FileAsset[]
    ): ViewInfo[] {
        // Update ViewInfo with the loaded data
        const updatedViewInfos = this.updateSingleViewInfo(viewInfos, viewKey, {
            view,
            explorerSnipps: snippets.sets,
            editorSnipps: snippets.list,
            tooltips,
            savedCode: view.Code
        });

        // Show warnings based on the loaded view
        showWarningsCallback(viewKey, view, templates);

        return updatedViewInfos;
    }
}