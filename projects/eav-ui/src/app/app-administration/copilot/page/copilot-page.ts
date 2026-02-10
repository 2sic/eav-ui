import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CopilotGeneratorComponent } from '../copilot-generator';
import { CopilotSpec } from '../copilot-specs';

@Component({
  selector: 'app-data-copilot',
  templateUrl: './copilot-page.html',
  styleUrl: './copilot-page.scss',
  imports: [
    CopilotGeneratorComponent,
    RouterOutlet,
    MatIconModule,
  ]
})
export class CopilotPageComponent {

  data: CopilotSpec;

  constructor(activatedRoute: ActivatedRoute) {
    this.data = activatedRoute.snapshot.data as CopilotSpec;
  }
}
