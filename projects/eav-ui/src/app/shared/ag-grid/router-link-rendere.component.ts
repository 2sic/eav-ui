import { AgRendererComponent } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-router-link-renderer',
  template: `
  @if(showThumbnail){
    <div class="container" >
      <ng-container *ngIf="this.thumbnail; else defaultThumbnail">
        <img class="image logo" [src]="this.thumbnail + '?w=40&h=40&mode=crop'" alt="Thumbnail">
      </ng-container>
      <ng-template #defaultThumbnail>
        <div class="image logo"><span class="material-symbols-outlined">star</span></div>
      </ng-template>
      <a class="default-link" [routerLink]="[url]">{{ name }}</a>
    </div>
  }
    <!-- Default, Show Only Link and name  -->
      @if(!showThumbnail){
        <a class="default-link" [routerLink]="[url]">{{ name }}</a>
      }
  `,
  imports: [CommonModule, RouterModule]
})
export class RouterLinkRendererComponent implements AgRendererComponent {
  url: string;
  name: string;
  showThumbnail: boolean = false;
  thumbnail: string;


  constructor() { }

  agInit(params: any): void {
    this.url = params.url;
    this.name = params.name;
    this.showThumbnail = params.showThumbnail;
    this.thumbnail = params.thumbnail;
  }

  refresh(params: any): boolean {
    return false;
  }

}
