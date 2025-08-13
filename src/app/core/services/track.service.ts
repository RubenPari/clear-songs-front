import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArtistSummary } from '../models/artist.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private apiUrl = `${environment.apiUrl}/track`;

  constructor(private http: HttpClient) {}

  /**
   * Fetches a summary of tracks, grouped by artist, within a certain range (inclusive).
   * @param min The minimum number of tracks an artist should have to be included in the response.
   * @param max The maximum number of tracks an artist should have to be included in the response.
   * @returns An observable containing an array of {@link ArtistSummary} objects, each representing an artist and the number of tracks they have in the given range.
   */
  getTrackSummary(min?: number, max?: number): Observable<ArtistSummary[]> {
    let params = new HttpParams();
    if (min !== undefined) {
      params = params.set('min', min.toString());
    }
    if (max !== undefined) {
      params = params.set('max', max.toString());
    }
    return this.http.get<ArtistSummary[]>(`${this.apiUrl}/summary`, { params });
  }

  /**
   * Deletes all tracks associated with a specific artist.
   * @param artistId The unique identifier of the artist whose tracks are to be deleted.
   * @returns An observable containing an {@link ApiResponse} object indicating the success or failure of the operation.
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
    let params = new HttpParams();
    if (min !== undefined) {
      params = params.set('min', min.toString());
    }
    if (max !== undefined) {
      params = params.set('max', max.toString());
    }
    return this.http.delete<ApiResponse>(`${this.apiUrl}/by-range`, { params });
  }
}
