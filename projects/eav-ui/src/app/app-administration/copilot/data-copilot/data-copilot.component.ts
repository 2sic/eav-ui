import { Component } from '@angular/core';
import { CopilotGeneratorComponent } from "../copilot-generator.component";

@Component({
    selector: 'app-data-copilot',
    standalone: true,
    providers: [
    ],
    templateUrl: './data-copilot.component.html',
    styleUrl: './data-copilot.component.scss',
    imports: [
      CopilotGeneratorComponent
    ]
})
export class DataCopilotComponent {

  constructor() {}

  ngOnInit(): void {
  }

}
