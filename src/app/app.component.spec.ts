import { TestBed, async } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { itemReducer } from './shared/reducers';
import { JsonPackage1Service } from './shared/services/json-package1.service';
import { JsonItem1Service } from './shared/services/json-item1.service';
import { JsonContentType1Service } from './shared/services/json-content-type1.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        EavItemDialogModule,
        StoreModule.forRoot({ items: itemReducer }),
        HttpClientModule
      ],
      providers: [JsonPackage1Service, JsonItem1Service, JsonContentType1Service]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
