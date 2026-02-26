/**
 * Playlist Service
 * 
 * Service for managing Spotify playlist operations including clearing tracks
 * from playlists and removing tracks from both playlists and the user's library.
 * 
 * This service provides methods to interact with the backend API's playlist endpoints,
 * enabling bulk operations on Spotify playlists through the application.
 * 
 * Features:
 * - Clear all tracks from a playlist (tracks remain in library)
 * - Clear tracks from playlist AND remove from user's library (with backup)
 * 
 * All operations are performed through the Spotify Web API and require proper
 * authentication and playlist ownership permissions.
 * 
 * @service
 * @providedIn root
 * @author Clear Songs Development Team
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserPlaylist } from '../models/artist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private apiUrl = `${environment.apiUrl}/playlist`;
  private http = inject(HttpClient);

  /**
   * Gets all playlists owned or followed by the user using the modern httpResource API.
   */
  getUserPlaylistsResource() {
    return httpResource<UserPlaylist[]>(`${this.apiUrl}/list`);
  }

  deleteAllPlaylistTracks(playlistId: string): Observable<ApiResponse> {
    const params = new HttpParams().set('id', playlistId);
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete-tracks`, { params });
  }

  deleteAllPlaylistAndUserTracks(playlistId: string): Observable<ApiResponse> {
    const params = new HttpParams().set('id', playlistId);
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete-tracks-and-library`, { params });
  }
}
