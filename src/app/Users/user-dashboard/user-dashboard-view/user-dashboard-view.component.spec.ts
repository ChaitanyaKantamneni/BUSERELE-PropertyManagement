import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashboardViewComponent } from './user-dashboard-view.component';

describe('UserDashboardViewComponent', () => {
  let component: UserDashboardViewComponent;
  let fixture: ComponentFixture<UserDashboardViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDashboardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
