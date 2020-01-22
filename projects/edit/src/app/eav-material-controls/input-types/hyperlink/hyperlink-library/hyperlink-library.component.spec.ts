import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HyperlinkLibraryComponent } from './hyperlink-library.component';

describe('HyperlinkLibraryComponent', () => {
  let component: HyperlinkLibraryComponent;
  let fixture: ComponentFixture<HyperlinkLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HyperlinkLibraryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HyperlinkLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
