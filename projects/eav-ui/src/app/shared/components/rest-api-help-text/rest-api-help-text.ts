import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rest-api-help-text',
  imports: [],
  templateUrl: './rest-api-help-text.html',
  styleUrl: './rest-api-help-text.scss'
})
export class RestApiHelpTextComponent {

  apiTitle = input.required<string>();

}
