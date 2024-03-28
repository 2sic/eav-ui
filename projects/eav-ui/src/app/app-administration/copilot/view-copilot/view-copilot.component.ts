import { Component } from '@angular/core';
import { CopilotGeneratorComponent } from "../copilot-generator.component";

@Component({
    selector: 'app-data-copilot',
    standalone: true,
    providers: [
    ],
    templateUrl: './view-copilot.component.html',
    styleUrl: './view-copilot.component.scss',
    imports: [
      CopilotGeneratorComponent
    ]
})
export class ViewCopilotComponent {

  constructor() {}

  ngOnInit(): void {
  }

}
