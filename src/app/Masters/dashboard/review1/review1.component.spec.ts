import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Review1Component } from './review1.component';

describe('Review1Component', () => {
  let component: Review1Component;
  let fixture: ComponentFixture<Review1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Review1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Review1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
