import { FieldSettings } from 'projects/edit-types';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'ItemFieldVisibility';

/**
 * Small helper to parse Item-Field-Visibility requirements from the URL.
 * This is to allow callers to specify which fields should be hidden.
 * For example, to make the edit-UI only open a specific WYSIWYG field and hide all other fields.
 */
export class ItemFieldVisibility {
  private defaultIsShow = true;
  private fields: Record<string, boolean> = null;

  private log = new EavLogger(nameOfThis, logThis);

  constructor(identifier: ItemIdentifierShared) {
    const l = this.log.fn('ctor', { identifier });
    var fields = identifier.ClientData?.fields as string;
    if (fields == null || fields == '') {
      l.end(null, 'no fields specified');
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
    l.end({ fields: this.fields, defaultIsShow: this.defaultIsShow });
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
}