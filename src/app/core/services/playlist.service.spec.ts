import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlaylistService } from './playlist.service';
import { environment } from '../../../environments/environment';
import { UserPlaylist } from '../models/artist.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlaylistService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PlaylistService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user playlists using httpResource', () => {
    const mockPlaylists: UserPlaylist[] = [
      { id: '1', name: 'Playlist 1', owner: 'User 1' },
      { id: '2', name: 'Playlist 2', owner: 'User 2' }
    ];

    const resource = service.getUserPlaylistsResource();
    
    // httpResource will trigger a request
    const req = httpMock.expectOne(`${environment.apiUrl}/playlist/list`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlaylists);

    // After flush, we can check the resource value
    // In a real test environment with Signals, this happens after a microtask or tick
    setTimeout(() => {
        expect(resource.value()).toEqual(mockPlaylists);
    }, 0);
  });

  it('should delete playlist tracks', () => {
    const playlistId = 'playlist123';
    const mockResponse = { success: true };

    service.deleteAllPlaylistTracks(playlistId).subscribe(response => {
      expect(response.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/playlist/delete-tracks?id=${playlistId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
