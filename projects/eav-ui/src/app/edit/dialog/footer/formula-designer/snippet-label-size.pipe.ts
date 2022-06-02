import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'snippetLabelSize' })
export class SnippetLabelSizePipe implements PipeTransform {

  private maxLength = 24;

  transform(label: string): string {
    if (label.length <= this.maxLength) { return label; }
    return `…${label.substring(label.length - this.maxLength)}`;
  }
}
