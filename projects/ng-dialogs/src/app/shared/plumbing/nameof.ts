
// NOTE / TODO: @SPM - not sure where to put such global helpers

// Inspired by https://schneidenbach.gitbooks.io/typescript-cookbook/content/nameof-operator.html
export const nameof = <T>(name: keyof T) => name;
