import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { MatInput } from '@angular/material/input';

@Directive({ selector: '[appMatInputAutofocus]' })
export class MatInputAutofocusDirective implements OnInit {
  @Input() autofocusSelectValue: string | boolean | null | undefined = false;

  constructor(private matInput: MatInput, private elementRef: ElementRef<HTMLInputElement>) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.matInput.focus();

      if (this.toBoolean(this.autofocusSelectValue)) {
        this.elementRef.nativeElement.setSelectionRange(0, this.matInput.value.length);
      }
    });
  }

  private toBoolean(value: any): boolean | null | undefined {
    if (typeof value === 'boolean') { return value; }
    if (typeof value === 'string') {
      const valueLowerCase = value.toLocaleLowerCase();
      if (valueLowerCase === 'true') { return true; }
      if (valueLowerCase === 'false') { return false; }
      return;
    }
    if (value == null) { return value; }
  }
}
