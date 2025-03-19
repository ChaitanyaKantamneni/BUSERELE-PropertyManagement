import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserwhichlistComponent } from './userwhichlist.component';

describe('UserwhichlistComponent', () => {
  let component: UserwhichlistComponent;
  let fixture: ComponentFixture<UserwhichlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserwhichlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserwhichlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
