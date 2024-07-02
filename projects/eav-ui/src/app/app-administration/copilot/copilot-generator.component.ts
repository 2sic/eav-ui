import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Context } from '../../shared/services/context';
import { map, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RichResult } from '../../shared/models/rich-result';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CopilotService } from './copilot-service';

@Component({
  selector: 'app-copilot-generator',
  standalone: true,
  providers: [
    CopilotService
  ],
  templateUrl: './copilot-generator.component.html',
  imports: [
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
  ]
})
export class CopilotGeneratorComponent {

  @Input() outputType: string;

  @Input() title?: string = 'Copilot Generator';

  webApiGeneratedCode: string = 'admin/code/generateDataModels';
  editions$ = this.copilotSvc.getEditions();

  generators$ = this.copilotSvc.getGenerators()
    .pipe(
      map((gens) => gens.filter(g => g.outputType === this.outputType))
    );

  selectedGenerator$ = this.generators$.pipe(map(gens => gens.find(g => g.name === this.selectedGenerator)));

  selectedGenerator = '';
  selectedEdition = '';

  constructor(
    private http: HttpClient,
    private context: Context,
    private snackBar: MatSnackBar,
    private copilotSvc: CopilotService,
  ) { }

  ngOnInit(): void {
    this.generators$.pipe(take(1)).subscribe(gens => {
      this.selectedGenerator = gens[0]?.name ?? '';
    });
    this.copilotSvc.specs.pipe(take(1)).subscribe(specs => {
      // this.selectedGenerator = specs.generators[0]?.name ?? '';
      this.selectedEdition = specs.editions.find(e => e.isDefault)?.name ?? '';
    });
  }

  autoGeneratedCode() {
    this.http.get<RichResult>(this.webApiGeneratedCode, {
      params: {
        appId: this.context.appId.toString(),
        edition: this.selectedEdition,
        generator: this.selectedGenerator,
      }
    }).subscribe(d => {
      console.log(d);
      this.snackBar.open(d.message + `\n (this took ${d.timeTaken}ms)`, null, { duration: 5000, });
    });
  }

}
