import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TippyDirective } from '../../../shared/directives/tippy.directive';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective
  ],
  templateUrl: './import-export.component.html',
  styleUrl: './import-export.component.scss'
})
export class ImportExportComponent {

  constructor(private router: Router) { }

  linkToPage(link: string): string {
    // Entfernt "import-export" aus dem Link, falls es im aktuellen Pfad vorhanden ist.
    const currentPath = this.router.url.replace('/import-export', '');
    return `${currentPath}/${link}`;
  }


}
