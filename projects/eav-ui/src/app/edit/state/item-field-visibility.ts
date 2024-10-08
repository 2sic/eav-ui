import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { FieldConstantsOfLanguage } from './fields-configs.model';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../shared/logging';

/**
 * Small helper to parse Item-Field-Visibility requirements from the URL.
 * This is to allow callers to specify which fields should be hidden.
 * For example, to make the edit-UI only open a specific WYSIWYG field and hide all other fields.
 */
export class ItemFieldVisibility {
  private defaultIsShow = true;
  private fields: Record<string, boolean> = null;

  private log = classLog({ItemFieldVisibility});

  constructor(identifier: ItemIdentifierShared) {
    const l = this.log.fn('ctor', { identifier });
    var fields = identifier.ClientData?.fields as string;
    if (fields == null || fields == '') {
      l.end('no fields specified');
      return;
    }
    
    // If the first character is a minus, then default is show all and just hide mentions
    this.defaultIsShow = (fields[0] == '-');
    if (this.defaultIsShow)
      fields = fields.substring(1);
    const ruleIsShow = !this.defaultIsShow;

    this.fields = fields.toLowerCase().split(',')
      .reduce((prev, f) => {
        prev[f] = ruleIsShow;
        return prev;
      }, {} as Record<string, boolean>);
    l.end('', { fields: this.fields, defaultIsShow: this.defaultIsShow });
  }

  hasRules(): boolean {
    return this.fields != null;
  }

  isVisibleDisabled(fieldName: string): boolean {
    const l = this.log.fn('isVisibleDisabled', { fieldName });

    // check if we have no rules at all - in which case never override
    if (!this.hasRules())
      return l.r(false, 'no rules');

    const override = this.fields[fieldName.toLowerCase()];
    
    return l.r(!(override ?? this.defaultIsShow));
  }

  static mergedVisible(settings: FieldSettings): boolean {
    return settings.Visible && !settings.VisibleDisabled;
  }

  /**  Make sure that groups, which have a forced-visible-field are also visible */
  makeParentGroupsVisible(allConstFieldParts: FieldConstantsOfLanguage[]) {
    const l = this.log.fn('makeParentGroupsVisible', { allConstFieldParts });

    if (!this.hasRules())
      return l.r(allConstFieldParts, 'no rules, no changes');

    // ATM in try-catch, to ensure we don't break anything
    try {
      allConstFieldParts.forEach((groupField, index) => {
        // Only work on group-starts
        if (!InputTypeHelpers.isGroupStart(groupField.inputTypeSpecs.inputType))
          return;

        // Ignore if visible-disabled is already ok
        if (groupField.settingsInitial.VisibleDisabled == false)
          return;

        // Check if any of the following fields is forced visible - before another group-start/end
        for (let i = index + 1; i < allConstFieldParts.length; i++) {
          const innerField = allConstFieldParts[i];

          // Stop checking the current group if we found another group start/end
          if (InputTypeHelpers.endsPreviousGroup(innerField.inputTypeSpecs.inputType))
            return;

          if (innerField.settingsInitial.VisibleDisabled == false) {
            l.a('Forced visible', { fieldName: groupField.fieldName, reason: innerField.fieldName });
            groupField.settingsInitial.VisibleDisabled = false;
            return;
          }
        }
      });
    } catch (e) {
      console.error('Error trying to set item field visibility', e);
    }

    return allConstFieldParts;
  }
}