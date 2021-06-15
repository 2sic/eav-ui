/** PublishMode is short version of PublishStatus */
export const PublishModes = {
  Show: 'show',
  Hide: 'hide',
  Branch: 'branch',
} as const;

export type PublishMode = typeof PublishModes[keyof typeof PublishModes];
