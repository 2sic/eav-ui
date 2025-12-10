import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CopilotGeneratorComponent } from '../copilot-generator.component';
import { CopilotSpec } from '../copilot-specs';

@Component({
  selector: 'app-data-copilot',
  templateUrl: './copilot-page.component.html',
  styleUrl: './copilot-page.component.scss',
  imports: [
    CopilotGeneratorComponent,
    RouterOutlet,
  ]
})
export class CopilotPageComponent {

  data: CopilotSpec;

  constructor(activatedRoute: ActivatedRoute) {
    this.data = activatedRoute.snapshot.data as CopilotSpec;
  }
}
