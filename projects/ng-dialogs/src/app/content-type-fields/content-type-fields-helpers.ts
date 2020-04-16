
export class ContentTypeFieldHelpers {
  static typeIcon(typeName: string): string  {
    switch (typeName) {
      case 'String':
        return 'text_fields';
      case 'Entity':
        return 'share';
      case 'Boolean':
        return 'toggle_on';
      case 'Number':
        return 'dialpad';
      case 'Custom':
        return 'extension';
      case 'DateTime':
        return 'today';
      case 'Hyperlink':
        return 'link';
      case 'Empty':
        return 'crop_free';
      default:
        return 'device_unknown';
    }
  }
}
