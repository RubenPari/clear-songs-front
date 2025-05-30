import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistSummaryListComponent } from './artist-summary-list.component';

describe('ArtistSummaryListComponent', () => {
  let component: ArtistSummaryListComponent;
  let fixture: ComponentFixture<ArtistSummaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistSummaryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
