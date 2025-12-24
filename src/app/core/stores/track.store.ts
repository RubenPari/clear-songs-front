/**
 * Track Store
 * 
 * Centralized state management for track-related data using Angular Signals.
 * This store provides reactive state management for:
 * - Artist summaries
 * - Loading states
 * - Error states
 * - Computed statistics
 * 
 * The store uses Angular Signals (Angular 16+) for better performance and
 * simpler API compared to RxJS BehaviorSubjects.
 * 
 * @service
 * @providedIn root
 * @author Clear Songs Development Team
 */
import { Injectable, signal, computed } from '@angular/core';
import { ArtistSummary } from '../models/artist.model';

@Injectable({
  providedIn: 'root',
})
export class TrackStore {
  /**
   * Private signals for internal state management
   */
  private _artists = signal<ArtistSummary[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  /**
   * Public readonly signals for components to read
   */
  public readonly artists = this._artists.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  
  /**
   * Computed signals for derived state
   */
  public readonly totalTracks = computed(() => 
    this._artists().reduce((sum, artist) => sum + artist.count, 0)
  );
  
  public readonly totalArtists = computed(() => 
    this._artists().length
  );
  
  public readonly topArtists = computed(() => 
    [...this._artists()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  );
  
  /**
   * Actions - Methods to update state
   */
  
  /**
   * Sets the artists list
   */
  setArtists(artists: ArtistSummary[]): void {
    this._artists.set(artists);
    this._error.set(null);
  }
  
  /**
   * Sets the loading state
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
  
  /**
   * Sets the error state
   */
  setError(error: string | null): void {
    this._error.set(error);
    if (error) {
      this._loading.set(false);
    }
  }
  
  /**
   * Removes an artist from the store
   */
  removeArtist(artistId: string): void {
    this._artists.update(artists => 
      artists.filter(a => a.id !== artistId)
    );
  }
  
  /**
   * Updates an artist in the store
   */
  updateArtist(artistId: string, updates: Partial<ArtistSummary>): void {
    this._artists.update(artists =>
      artists.map(artist =>
        artist.id === artistId ? { ...artist, ...updates } : artist
      )
    );
  }
  
  /**
   * Resets the store to initial state
   */
  reset(): void {
    this._artists.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
