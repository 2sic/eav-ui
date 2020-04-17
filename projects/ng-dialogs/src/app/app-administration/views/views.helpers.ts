import { View } from '../shared/models/view.model';

export function calculateViewType(view: View) {
  let value = '';
  let icon = '';
  if (view.HasQuery) {
    value = 'Data (from query)';
    icon = 'filter';
  } else if (view.List) {
    value = 'Items (list)';
    icon = 'menu';
  } else if (!view.ContentType && !view.HasQuery) {
    value = 'Code';
    icon = 'check_box_outline_blank';
  } else if (!view.List) {
    value = 'Item (one)';
    icon = 'looks_one';
  }
  return { value, icon };
}
