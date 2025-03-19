import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserpropertiesComponent } from './userproperties.component';

describe('UserpropertiesComponent', () => {
  let component: UserpropertiesComponent;
  let fixture: ComponentFixture<UserpropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserpropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserpropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
