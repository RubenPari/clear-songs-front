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
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserPlaylist } from '../models/artist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  /**
   * Base API URL for playlist endpoints
   * Constructed from environment configuration
   */
  private apiUrl = `${environment.apiUrl}/playlist`;

  /**
   * Constructor
   * 
   * @param http - HttpClient instance for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Gets all playlists owned or followed by the user
   * 
   * Retrieves a list of all playlists that the user owns or follows,
   * including playlist metadata such as name and cover image.
   * 
   * @returns Observable that emits an array of Playlist objects
   * 
   * @example
   * this.playlistService.getUserPlaylists()
   *   .subscribe({
   *     next: (playlists) => console.log('Playlists:', playlists),
   *     error: (error) => console.error('Failed:', error)
   *   });
   */
  getUserPlaylists(): Observable<UserPlaylist[]> {
    return this.http.get<UserPlaylist[]>(`${this.apiUrl}/list`);
  }

  /**
   * Deletes all tracks from a Spotify playlist
   * 
   * Removes all tracks from the specified playlist but keeps them in the user's
   * saved library. This is useful for clearing playlists without losing the tracks.
   * 
   * Important Notes:
   * - The user must own or have edit permissions for the playlist
   * - Tracks are only removed from the playlist, not from the library
   * - The operation may take time for large playlists due to Spotify rate limits
   * 
   * @param playlistId - The Spotify playlist ID (alphanumeric string from playlist URL)
   * @returns Observable that emits an ApiResponse indicating success or failure
   * 
   * @example
   * this.playlistService.deleteAllPlaylistTracks('37i9dQZF1DXcBWIGoYBM5M')
   *   .subscribe({
   *     next: () => console.log('Playlist cleared'),
   *     error: (error) => console.error('Failed:', error)
   *   });
   */
  deleteAllPlaylistTracks(playlistId: string): Observable<ApiResponse> {
    const params = new HttpParams().set('id', playlistId);
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete-tracks`, { params });
  }

  /**
   * Deletes all tracks from a playlist AND removes them from the user's library
   * 
   * This is a more destructive operation that:
   * 1. Removes tracks from the specified playlist
   * 2. Removes the same tracks from the user's saved library
   * 3. Creates a backup before deletion for recovery purposes
   * 
   * Important Notes:
   * - This operation is permanent and affects the user's library
   * - A backup is automatically created before deletion
   * - The user must own or have edit permissions for the playlist
   * - Large playlists may take time due to Spotify rate limits
   * 
   * Use Case:
   * Useful for cleaning up playlists and library simultaneously, such as
   * removing unwanted tracks that were added from a specific playlist.
   * 
   * @param playlistId - The Spotify playlist ID (alphanumeric string from playlist URL)
   * @returns Observable that emits an ApiResponse indicating success or failure
   * 
   * @example
   * this.playlistService.deleteAllPlaylistAndUserTracks('37i9dQZF1DXcBWIGoYBM5M')
   *   .subscribe({
   *     next: () => console.log('Playlist and library cleared'),
   *     error: (error) => console.error('Failed:', error)
   *   });
   */
  deleteAllPlaylistAndUserTracks(playlistId: string): Observable<ApiResponse> {
    const params = new HttpParams().set('id', playlistId);
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete-tracks-and-library`, { params });
  }
}
