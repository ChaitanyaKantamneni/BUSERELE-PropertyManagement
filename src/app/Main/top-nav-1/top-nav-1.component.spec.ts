import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNav1Component } from './top-nav-1.component';

describe('TopNav1Component', () => {
  let component: TopNav1Component;
  let fixture: ComponentFixture<TopNav1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNav1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopNav1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
