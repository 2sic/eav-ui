import { PublishMode } from './publish-mode.models';
/**
 * The properties on this object must match the keys of PublishModes
 * They are all optional though
 */
export interface VersioningOptions extends Partial<Record<PublishMode, boolean>> {
}
