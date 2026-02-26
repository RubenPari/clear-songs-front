import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TrackService } from './track.service';
import { TrackStore } from '../stores/track.store';
import { environment } from '../../../environments/environment';
import { ArtistSummary } from '../models/artist.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TrackService', () => {
  let service: TrackService;
  let httpMock: HttpTestingController;
  let trackStore: jasmine.SpyObj<TrackStore>;

  beforeEach(() => {
    const trackStoreSpy = jasmine.createSpyObj('TrackStore', ['setArtists', 'removeArtist']);

    TestBed.configureTestingModule({
      providers: [
        TrackService,
        { provide: TrackStore, useValue: trackStoreSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TrackService);
    httpMock = TestBed.inject(HttpTestingController);
    trackStore = TestBed.inject(TrackStore) as jasmine.SpyObj<TrackStore>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch track summary using httpResource', async () => {
    const mockData: ArtistSummary[] = [
      { id: '1', name: 'Artist 1', count: 10 },
      { id: '2', name: 'Artist 2', count: 5 }
    ];

    const resource = service.getTrackSummaryResource();
    
    // In Angular 19/20, httpResource returns a ResourceRef
    // We expect a call to the summary endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/track/summary?`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    // Wait for resource to resolve
    await TestBed.runInInjectionContext(() => {
        return new Promise(resolve => {
            const effectRef = TestBed.inject(TestBed); // or use effect() but inside test is tricky
            // Actually in Jasmine we can just check the value after flush if it's synchronous or use a small delay
            setTimeout(() => {
                expect(resource.value()).toEqual(mockData);
                resolve(true);
            }, 0);
        });
    });
  });

  it('should delete tracks by artist and update store', () => {
    const artistId = '123';
    const mockResponse = { success: true, message: 'Deleted' };

    service.deleteTracksByArtist(artistId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(trackStore.removeArtist).toHaveBeenCalledWith(artistId);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/track/by-artist/${artistId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
