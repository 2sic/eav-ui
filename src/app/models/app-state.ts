import { Item } from '../models/item';
import { ContentType } from '../models/content-type';

export interface AppState {
    items: Item[];
    contentTypes: ContentType[];
}
