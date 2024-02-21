import { ContentItem } from "../../content-items/models/content-item.model";
import { Field } from "../../content-type-fields/models/field.model";
import { MetadataDto } from "../../metadata"

export interface AppInternals {
  EntityLists: EntityLists,
  FieldAll: FieldAll;
  MetadataList: MetadataDto,
}

interface EntityLists {
  AppResources: ContentItem[],
  AppSettings: ContentItem[],
  ResourcesSystem: ContentItem[],
  SettingsSystem: ContentItem[],
  ToSxcContentApp: ContentItem[],
}

interface FieldAll {
  AppResources: Field[],
  AppSettings: Field[],
}