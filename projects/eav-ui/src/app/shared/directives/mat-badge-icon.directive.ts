import { Directive, Input, OnInit, Renderer2, RendererStyleFlags2 } from "@angular/core";
import { MatBadge } from "@angular/material/badge";

@Directive({
  selector: '[matBadgeIcon]',
})
export class MatBadgeIconDirective extends MatBadge implements OnInit {
  @Input() matBadgeIcon: string = '';

  constructor( private renderer: Renderer2 ) { super(); }

  ngOnInit(): void {
    if(!this.matBadgeIcon)
      return;

    // TypeScript hack to get access to private function
    const badgeElement = (this as any)['_createBadgeElement']();

    // Style the badge element as a flex container
    this.renderer.setStyle(badgeElement, 'display', 'flex');
    
    // Create the icon element
    const iconElement = this.renderer.createElement('mat-icon');
    this.renderer.appendChild(iconElement, this.renderer.createText(this.matBadgeIcon));
    
    // Set font for Material
    this.renderer.setStyle(iconElement, 'font-family', 'Material Symbols Outlined');

    // Set styles for the icon
    this.renderer.setStyle(iconElement, 'font-size', '10');
    this.renderer.setStyle(iconElement, 'height', '16px');
    this.renderer.setStyle(iconElement, 'line-height', '16px');
    this.renderer.setStyle(iconElement, 'color', '#fff', RendererStyleFlags2.Important);
    
    // Add Material icon classes
    this.renderer.addClass(iconElement, 'mat-icon');
    this.renderer.addClass(iconElement, 'material-icons');
    
    // Append the icon to the badge
    this.renderer.appendChild(badgeElement, iconElement);
  }
}
