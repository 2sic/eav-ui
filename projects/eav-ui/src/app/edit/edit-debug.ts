import { environment } from '../../environments/environment';

/**
 * List of fields to debug across the entire application.
 * 
 * Change as you need, but after debugging, best set it back to [].
 */
export const DebugFields: string[] = !environment.production
  // ? ['StringPicker']
  // ? ['NumberInputAddUntillDevisibleBy5']
  // ? ['WysiwygConfiguration']
  ? ['Items']
  // ? ['Title']
  // ? [] // no fields
  // ? ['*'] // all fields
  : [];
