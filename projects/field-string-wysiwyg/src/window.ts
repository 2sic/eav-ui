import { TinyMCE } from 'tinymce';

declare global {
  interface Window {
    tinymce: TinyMCE;
  }
}