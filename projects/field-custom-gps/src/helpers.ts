import template from './template.html';
import css from './styles.css';

export function buildTemplate(): string {
  return `${template}<style>\n${css}\n</style>`;
}
