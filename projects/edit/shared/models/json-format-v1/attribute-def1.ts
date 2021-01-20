import { Entity1 } from './entity1';

export class AttributeDef1 {
  Name: string;
  Type: string;
  InputType: string;
  IsTitle: boolean;
  Metadata: Entity1[];

  constructor(Name: string, Type: string, InputType: string, IsTitle: boolean, Metadata: Entity1[]) {
    this.Name = Name;
    this.Type = Type;
    this.InputType = InputType;
    this.IsTitle = IsTitle;
    this.Metadata = Metadata;
  }
}
