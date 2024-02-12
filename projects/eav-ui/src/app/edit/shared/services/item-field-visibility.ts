import { FieldSettings } from 'projects/edit-types';
import { consoleLogEditForm } from '../../../shared/helpers/console-log-angular.helper';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';

export class ItemFieldVisibility {
  private defaultIsShow = true;
  private fields: Record<string, boolean> = null;
  constructor(identifier: ItemIdentifierShared) {
    var fields = identifier.ClientData?.fields as string;
    if (fields == null || fields == '') return;
    
    // If the first character is a minus, then default is show all and just hide mentions
    this.defaultIsShow = (fields[0] == '-');
    if (this.defaultIsShow) fields = fields.substring(1);
    const ruleIsShow = !this.defaultIsShow;

    this.fields = fields.toLowerCase().split(',')
      .reduce((prev, f) => {
        prev[f] = ruleIsShow;
        return prev;
      }, {} as Record<string, boolean>);
    consoleLogEditForm('ItemFieldVisibility', this.fields, 'default', this.defaultIsShow);
  }

  hasRules(): boolean {
    return this.fields != null;
  }

  isVisibleDisabled(fieldName: string): boolean {
    // check if we have no rules at all - in which case never override
    if (this.fields == null) return false;
    const override = this.fields[fieldName.toLowerCase()];
    return !(override ?? this.defaultIsShow);
  }

  static mergedVisible(settings: FieldSettings): boolean {
    return settings.Visible && !settings.VisibleDisabled;
  }
}