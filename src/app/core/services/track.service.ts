/**
 * Track Service
 * 
 * Service for managing track-related operations including fetching track summaries,
 * deleting tracks by artist, and deleting tracks by count range.
 * 
 * This service provides methods to interact with the backend API's track endpoints,
 * handling all HTTP communication for track management features.
 * 
 * Features:
 * - Get track summaries grouped by artist with optional filtering
 * - Delete all tracks from a specific artist
 * - Delete tracks based on count ranges (e.g., artists with 1-5 tracks)
 * 
 * All methods return RxJS Observables, allowing components to handle responses
 * reactively and manage loading states and errors appropriately.
 * 
 * @service
 * @providedIn root
 * @author Clear Songs Development Team
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArtistSummary, Track } from '../models/artist.model';
import { ApiResponse } from '../models/api-response.model';
import { buildRangeParams } from '../utils/http-params.helper';
import { TrackStore } from '../stores/track.store';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private apiUrl = `${environment.apiUrl}/track`;
  private http = inject(HttpClient);
  private trackStore = inject(TrackStore);

  /**
   * Fetches a summary of tracks using the modern httpResource API.
   * This automatically integrates with HttpClient, interceptors, and signals.
   */
  getTrackSummaryResource(min?: number, max?: number) {
    return httpResource<ArtistSummary[]>(() => {
      const params = buildRangeParams(min, max);
      return `${this.apiUrl}/summary?${params.toString()}`;
    });
  }

  deleteTracksByArtist(artistId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/by-artist/${artistId}`).pipe(
      tap(() => {
        this.trackStore.removeArtist(artistId);
      })
    );
  }

  deleteTracksByRange(min?: number, max?: number): Observable<ApiResponse> {
    const params = buildRangeParams(min, max);
    return this.http.delete<ApiResponse>(`${this.apiUrl}/by-range`, { params });
  }

  getTracksByArtist(artistId: string): Observable<Track[]> {
    return this.http.get<Track[]>(`${this.apiUrl}/by-artist/${artistId}`);
  }

  deleteTrack(trackId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${trackId}`);
  }
}
