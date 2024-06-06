import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CopilotSpec } from '../copilot-specs';
import { CopilotGeneratorComponent } from '../copilot-generator.component';

@Component({
    selector: 'app-data-copilot',
    standalone: true,
    providers: [
    ],
    templateUrl: './copilot-page.component.html',
    styleUrl: './copilot-page.component.scss',
    imports: [
      CopilotGeneratorComponent
    ]
})
export class CopilotPageComponent {

  data: CopilotSpec;

  constructor(activatedRoute: ActivatedRoute) {
    this.data = activatedRoute.snapshot.data as CopilotSpec;
  }

}
