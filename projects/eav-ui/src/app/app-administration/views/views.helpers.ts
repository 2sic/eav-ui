import { View } from '../models/view.model';

export function calculateViewType(view: View) {
  let value = '';
  let icon = '';
  if (view.HasQuery) {
    value = 'Data (from query)';
    icon = 'filter_list';
  } else if (view.List) {
    value = 'Items (list)';
    icon = 'format_list_numbered';
  } else if (!view.ContentType && !view.HasQuery) {
    value = 'Code';
    icon = 'check_box_outline_blank';
  } else if (!view.List) {
    value = 'Item (one)';
    icon = 'looks_one';
  }
  return { value, icon };
}
