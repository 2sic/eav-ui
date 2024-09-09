import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { EavLogger } from '../../shared/logging/eav-logger';
import isEqual from 'lodash-es/isEqual';
import { Signal } from '@angular/core';
import { FieldProps } from './fields-configs.model';

const logSpecs = {
  enabled: false,
  name: 'FieldsPropertiesUpdates',
};

/**
 * Manage "manual" / forced updates of fields properties
 */
export class FieldsPropertiesUpdates {
  log: EavLogger;

  constructor(private entityGuid: string, private fieldsProps: Signal<Record<string, FieldProps>>) {
    this.log = new EavLogger({ ...logSpecs, name: `${logSpecs.name}[${entityGuid.substring(0, 8)}]` });
  }

  fieldPropsMixins: Record<string, Partial<FieldSettings>> = {};

  hasChanges(): boolean {
    return Object.keys(this.fieldPropsMixins).length > 0;
  }

  /**
   * Modify a setting, ATM just to set collapsed / dialog-open states.
   * Note that this change won't fire the formulas - which may not be correct.
   */
  updateSetting(fieldName: string, update: Partial<FieldSettings>, source: string): void {
    const queueWasEmpty = Object.keys(this.fieldPropsMixins).length === 0;
    const l = this.log.fn('updateSetting', { source, fieldName, update, queueWasEmpty });
    // Test if the update is a change, or if it's the same as the current value
    const before = this.fieldsProps()[fieldName].settings;
    const after = { ...before, ...update };
    if (isEqual(before, after))
      return l.end(`no change; entityGuid: ${this.entityGuid}; fieldName: ${fieldName}`);
    // Add change to queue, but mix with previous changes in queue.
    const prev = this.fieldPropsMixins[fieldName] ?? {};
    this.fieldPropsMixins[fieldName] = { ...prev, ...update };
    
    l.end('added to queue', { before, after, update });
  }

  mergeMixins(before: Record<string, FieldProps>): Record<string, FieldProps> {
    const l = this.log.fn('mergeMixins', { before, mixins: this.fieldPropsMixins });
    const mixins = this.fieldPropsMixins;
    if (Object.keys(mixins).length === 0)
      return before;

    const final = Object.keys(mixins).reduce((acc, key) => {
      const ofField = acc[key];
      const update = mixins[key];
      return {
        ...acc,
        [key]: {
          ...ofField,
          settings: { ...ofField.settings, ...update }
        }
      };
    }, before);

    this.fieldPropsMixins = {};
    return l.r(final, `merged`);
  }
}