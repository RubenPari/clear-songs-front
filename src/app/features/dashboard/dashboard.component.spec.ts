import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TrackService } from '../../core/services/track.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { TrackStore } from '../../core/stores/track.store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, ResourceStatus } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let trackService: jasmine.SpyObj<TrackService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let trackStore: jasmine.SpyObj<TrackStore>;
  let modalService: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    const trackServiceSpy = jasmine.createSpyObj('TrackService', ['getTrackSummaryResource', 'deleteTracksByArtist']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const trackStoreSpy = jasmine.createSpyObj('TrackStore', ['removeArtist']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    // Mock the resource API
    const mockResource = {
        value: signal([]),
        isLoading: signal(false),
        error: signal(null),
        status: signal(ResourceStatus.Resolved),
        reload: jasmine.createSpy('reload')
    };
    trackServiceSpy.getTrackSummaryResource.and.returnValue(mockResource);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: TrackService, useValue: trackServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: TrackStore, useValue: trackStoreSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    trackService = TestBed.inject(TrackService) as jasmine.SpyObj<TrackService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    trackStore = TestBed.inject(TrackStore) as jasmine.SpyObj<TrackStore>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate statistics correctly from signals', () => {
    const mockData = [
      { id: '1', name: 'Artist 1', count: 10 },
      { id: '2', name: 'Artist 2', count: 20 }
    ];
    
    // Trigger signal update via service mock
    const resource = trackService.getTrackSummaryResource();
    (resource.value as any).set(mockData);
    
    expect(component.totalArtists()).toBe(2);
    expect(component.totalTracks()).toBe(30);
  });

  it('should update search filter and filter artists', () => {
    const mockData = [
      { id: '1', name: 'Alice', count: 10 },
      { id: '2', name: 'Bob', count: 20 }
    ];
    
    const resource = trackService.getTrackSummaryResource();
    (resource.value as any).set(mockData);
    
    component.searchFilter.set('ali');
    
    expect(component.filteredArtists().length).toBe(1);
    expect(component.filteredArtists()[0].name).toBe('Alice');
  });

  it('should reload data when loadTrackSummary is called', () => {
    component.loadTrackSummary();
    const resource = trackService.getTrackSummaryResource();
    expect(resource.reload).toHaveBeenCalled();
  });
});
