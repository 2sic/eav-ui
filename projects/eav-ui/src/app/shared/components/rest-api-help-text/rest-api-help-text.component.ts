import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rest-api-help-text',
  imports: [],
  templateUrl: './rest-api-help-text.component.html',
  styleUrl: './rest-api-help-text.component.scss'
})
export class RestApiHelpTextComponent {

  apiTitle = input.required<string>();

}
