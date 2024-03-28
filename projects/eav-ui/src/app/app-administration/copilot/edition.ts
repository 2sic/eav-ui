export interface Edition extends EditionShared {
  label: string;
  isDefault: boolean;
}

export interface EditionDto extends EditionShared {
  isDefault?: boolean;
}


interface EditionShared {
  name: string;
  description: string;
}