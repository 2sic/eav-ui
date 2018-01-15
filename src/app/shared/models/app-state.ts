import { Item } from '../models/item';
import { ContentType } from '../models/content-type';

export class AppState {
    items: Item[];
    contentTypes: ContentType[];
}
