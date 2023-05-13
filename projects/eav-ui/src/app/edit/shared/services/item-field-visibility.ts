import { FieldSettings } from 'projects/edit-types';
import { EavHeader } from '../models/eav';

export class ItemFieldVisibility {
  private fields: string[] = [];
  constructor(private identifier: EavHeader) {
    var fields = identifier.Prefill?._fields as string;
    if (fields == null) return;
    this.fields = fields.toLowerCase().split(',');
  }

  checkForceHide(fieldName: string): boolean {
    if (this.fields.length == 0) return false;
    return (this.fields.find(f => f == fieldName.toLowerCase()) != null);
  }

  static mergedVisible(settings: FieldSettings): boolean {
    return settings.Visible && !settings.hideOverride;
  }
}