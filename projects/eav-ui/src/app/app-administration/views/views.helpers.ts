import { View } from '../models/view.model';

export function calculateViewType(view: View) {
  let value = '';
  let icon = '';
  if (view.HasQuery) {
    value = 'Data (from query)';
    icon = 'filter-list';
  } else if (view.List) {
    value = 'Items (list)';
    icon = 'format-list-numbered';
  } else if (!view.ContentType && !view.HasQuery) {
    value = 'Code';
    icon = 'check-box-outline-blank';
  } else if (!view.List) {
    value = 'Item (one)';
    icon = 'looks-one';
  }
  return { value, icon };
}
