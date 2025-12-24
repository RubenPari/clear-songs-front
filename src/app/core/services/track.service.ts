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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArtistSummary } from '../models/artist.model';
import { ApiResponse } from '../models/api-response.model';
import { buildRangeParams } from '../utils/http-params.helper';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  /**
   * Base API URL for track endpoints
   * Constructed from environment configuration
   */
  private apiUrl = `${environment.apiUrl}/track`;

  /**
   * Constructor
   * 
   * @param http - HttpClient instance for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Fetches a summary of tracks, grouped by artist, within a certain range (inclusive).
   * @param min The minimum number of tracks an artist should have to be included in the response.
   * @param max The maximum number of tracks an artist should have to be included in the response.
   * @returns An observable containing an array of {@link ArtistSummary} objects, each representing an artist and the number of tracks they have in the given range.
   */
  getTrackSummary(min?: number, max?: number): Observable<ArtistSummary[]> {
    const params = buildRangeParams(min, max);
    return this.http.get<ArtistSummary[]>(`${this.apiUrl}/summary`, { params });
  }

  /**
   * Deletes all tracks associated with a specific artist
   * 
   * Removes all tracks from the user's library that belong to the specified artist.
   * This operation is permanent and creates a backup before deletion for recovery purposes.
   * 
   * The deletion process:
   * 1. Creates a backup of tracks to be deleted
   * 2. Removes tracks from user's Spotify library
   * 3. Updates the database to reflect the changes
   * 
   * @param artistId - The unique identifier of the artist whose tracks are to be deleted
   * @returns Observable that emits an ApiResponse indicating success or failure
   * 
   * @example
   * this.trackService.deleteTracksByArtist('artist123')
   *   .subscribe({
   *     next: (response) => console.log('Tracks deleted:', response),
   *     error: (error) => console.error('Deletion failed:', error)
   *   });
   */
  deleteTracksByArtist(artistId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/by-artist/${artistId}`);
  }

  /**
   * Deletes all tracks within a certain range (inclusive).
   * @param min The minimum number of tracks a song should have to be included in the deletion.
   * @param max The maximum number of tracks a song should have to be included in the deletion.
   * @returns An observable containing an {@link ApiResponse} object indicating the success or failure of the operation.
   */
  deleteTracksByRange(min?: number, max?: number): Observable<ApiResponse> {
    const params = buildRangeParams(min, max);
    return this.http.delete<ApiResponse>(`${this.apiUrl}/by-range`, { params });
  }
}
