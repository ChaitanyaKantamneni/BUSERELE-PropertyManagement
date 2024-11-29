import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSideNavComponent } from './dashboard-side-nav.component';

describe('DashboardSideNavComponent', () => {
  let component: DashboardSideNavComponent;
  let fixture: ComponentFixture<DashboardSideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSideNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
