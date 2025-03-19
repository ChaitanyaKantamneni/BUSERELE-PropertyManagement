import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewreviewsComponent } from './viewreviews.component';

describe('ViewreviewsComponent', () => {
  let component: ViewreviewsComponent;
  let fixture: ComponentFixture<ViewreviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewreviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewreviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
