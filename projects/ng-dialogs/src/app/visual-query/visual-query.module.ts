import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { VisualQueryRoutingModule } from './visual-query-routing.module';
import { VisualQueryComponent } from './visual-query.component';
import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { RunExplorerComponent } from './run-explorer/run-explorer.component';
import { AddExplorerComponent } from './add-explorer/add-explorer.component';

@NgModule({
  declarations: [
    VisualQueryComponent,
    RunExplorerComponent,
    AddExplorerComponent,
  ],
  entryComponents: [
    VisualQueryComponent,
    RunExplorerComponent,
    AddExplorerComponent,
  ],
  imports: [
    CommonModule,
    VisualQueryRoutingModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  providers: [
    Context,
    QueryDefinitionService,
  ]
})
export class VisualQueryModule { }
