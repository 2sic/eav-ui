import { template } from './template';
import { styles } from './styles';

export function buildTemplate(): string {
  return `${template}<style>\n${styles}\n</style>`;
}
