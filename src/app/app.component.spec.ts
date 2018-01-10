import { TestBed, async } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { itemReducer } from './shared/reducers';
import { JsonToModelService } from './shared/services/json-to-model.service';

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
      providers: [JsonToModelService]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
