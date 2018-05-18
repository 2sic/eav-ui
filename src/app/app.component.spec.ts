import { TestBed, async } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
import { Routes, RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

const routes: Routes = [
  {
    path: 'eav-item-dialog',
    loadChildren: 'app/eav-item-dialog/eav-item-dialog.module#EavItemDialogModule'
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        EavItemDialogModule,
        StoreModule.forRoot({}),
        HttpClientModule,
        RouterModule.forRoot(routes),
      ],
      providers: [ItemService, ContentTypeService, , { provide: APP_BASE_HREF, useValue: '/' }]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
