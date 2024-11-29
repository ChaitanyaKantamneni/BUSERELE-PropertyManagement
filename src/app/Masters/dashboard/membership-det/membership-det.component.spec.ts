import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipDetComponent } from './membership-det.component';

describe('MembershipDetComponent', () => {
  let component: MembershipDetComponent;
  let fixture: ComponentFixture<MembershipDetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipDetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
