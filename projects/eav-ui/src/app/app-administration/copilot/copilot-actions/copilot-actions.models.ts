export type CopilotActionsType = 'generate' | 'delete';

export interface CopilotActionsParams {
  do: (verb: CopilotActionsType, item: any) => void;
}
