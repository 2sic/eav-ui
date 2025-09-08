import { View } from '../models/view.model';

export function calculateViewType(view: View): { value: string; icon: string } {

  if (view.Id < 0)
    return { value: 'Shared view, not editable', icon: 'share' };

  if (view.HasQuery)
    return { value: 'Data (from query)', icon: 'filter_list' };

  if (view.List)
    return { value: 'Items (list)', icon: 'format_list_numbered' };
  
  if (!view.ContentType && !view.HasQuery)
    return { value: 'Code', icon: 'check_box_outline_blank' };

  if (!view.List)
    return { value: 'Item (one)', icon: 'looks_one' };

  return { value: '', icon: '' };
}
