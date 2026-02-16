/**
 * Dashboard Component
 * 
 * The main dashboard component that displays an overview of the user's Spotify library.
 * It provides statistics, visualizations, and management tools for tracks and artists.
 * 
 * Features:
 * - Library statistics (total tracks, total artists, average tracks per artist)
 * - Bar chart visualization of top 5 artists by track count (using D3.js)
 * - Sortable and filterable table of all artists with track counts
 * - Bulk deletion of tracks by artist
 * - Real-time data refresh
 * 
 * The component uses Bootstrap components for UI and D3.js
 * for data visualization. It implements proper memory management with takeUntilDestroyed()
 * to prevent memory leaks from subscriptions.
 * 
 * Data Flow:
 * 1. Component loads -> fetch track summary from backend
 * 2. Backend returns artist summaries with track counts
 * 3. Component calculates statistics and updates chart
 * 4. User can filter, sort, or delete tracks
 * 5. After deletion, data is refreshed automatically
 * 
 * @component
 * @selector app-dashboard
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';

import { ArtistSummary } from '../../core/models/artist.model';
import { TrackService } from '../../core/services/track.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { D3BarChartComponent } from '../../shared/components/d3-bar-chart/d3-bar-chart.component';
import { SkeletonStatComponent, SkeletonTableComponent, SkeletonChartComponent } from '../../shared/components/skeleton/skeleton-components';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    D3BarChartComponent,
    SkeletonStatComponent,
    SkeletonTableComponent,
    SkeletonChartComponent
  ]
})
export class DashboardComponent implements OnInit {
  /**
   * DestroyRef for managing subscription cleanup
   * Used with takeUntilDestroyed() to automatically unsubscribe when component is destroyed
   */
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private trackService: TrackService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private modalService: NgbModal
  ) {}

  /**
   * List of artists with track counts
   */
  artists: ArtistSummary[] = [];

  /**
   * Filtered list of artists for display
   */
  filteredArtists: ArtistSummary[] = [];

  /**
   * Search filter value
   */
  searchFilter: string = '';

  /**
   * Current page for pagination
   */
  currentPage: number = 1;

  /**
   * Items per page
   */
  itemsPerPage: number = 10;

  /**
   * Sort column
   */
  sortColumn: string = 'name';

  /**
   * Sort direction
   */
  sortDirection: 'asc' | 'desc' = 'asc';

  /**
   * Total number of tracks across all artists
   * Calculated from the artist summary data
   */
  totalTracks = 0;

  /**
   * Total number of unique artists in the library
   * Calculated from the artist summary data
   */
  totalArtists = 0;

  /**
   * Loading state for skeleton screens
   */
  isLoading = true;

  /**
   * Chart data for D3.js bar chart
   * 
   * Contains the data to be displayed in the bar chart:
   * - label: Artist name
   * - value: Track count
   */
  public chartData: Array<{ label: string; value: number }> = [];

  /**
   * Chart colors for D3.js bar chart
   */
  public chartColors: string[] = [
    'rgba(99, 102, 241, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)'
  ];


  /**
   * Component Initialization
   * 
   * Called once when the component is initialized. Loads the track summary
   * data to populate the dashboard with statistics and artist information.
   */
  ngOnInit(): void {
    this.loadTrackSummary();
  }


  /**
   * Load Track Summary Data
   * 
   * Fetches the track summary from the backend, which includes:
   * - List of all artists with track counts
   * - Data grouped and aggregated by artist
   * 
   * On success:
   * - Stores artist data and applies filtering
   * - Calculates statistics (total tracks, total artists)
   * - Updates the bar chart with top 5 artists
   * 
   * Uses takeUntilDestroyed() to automatically clean up the subscription
   * when the component is destroyed, preventing memory leaks.
   */
  loadTrackSummary(): void {
    this.isLoading = true;
    this.loadingService.show();
    this.trackService.getTrackSummary()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loadingService.hide();
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.artists = data;
          this.applyFilter();
          this.calculateStats(data);
          this.setupChart(data);
        },
        error: () => {
          this.notificationService.error('Failed to load track summary');
        },
      });
  }

  /**
   * Calculate Library Statistics
   * 
   * Computes aggregate statistics from the artist summary data:
   * - Total number of unique artists
   * - Total number of tracks across all artists
   * 
   * These statistics are displayed in stat cards on the dashboard.
   * 
   * @param data - Array of artist summaries with track counts
   */
  calculateStats(data: ArtistSummary[]): void {
    this.totalArtists = data.length;
    this.totalTracks = data.reduce((sum, artist) => sum + artist.count, 0);
  }

  /**
   * Setup Bar Chart Data
   * 
   * Prepares the top 5 artists by track count for visualization in the D3.js bar chart.
   * 
   * Process:
   * 1. Creates a copy of the data array (to avoid mutating original)
   * 2. Sorts artists by track count in descending order
   * 3. Takes the top 5 artists
   * 4. Maps to chart data format with label and value
   * 
   * @param data - Array of artist summaries with track counts
   */
  setupChart(data: ArtistSummary[]): void {
    const sortedArtists = [...data].sort((a, b) => b.count - a.count).slice(0, 5);
    this.chartData = sortedArtists.map(artist => ({
      label: artist.name,
      value: artist.count
    }));
  }

  /**
   * Apply Table Filter
   * 
   * Filters the artist table based on user input in the search field.
   * The filter is case-insensitive and matches against artist names.
   */
  applyFilter(): void {
    let filtered = this.artists;
    
    if (this.searchFilter) {
      const filterValue = this.searchFilter.trim().toLowerCase();
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(filterValue)
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (this.sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortColumn === 'count') {
        comparison = a.count - b.count;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.filteredArtists = filtered;
    this.currentPage = 1; // Reset to first page when filtering
  }
  
  /**
   * Sort table by column
   */
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }
  
  /**
   * Get paginated artists
   */
  get paginatedArtists(): ArtistSummary[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredArtists.slice(start, end);
  }
  
  /**
   * Get total pages
   */
  get totalPages(): number {
    return Math.ceil(this.filteredArtists.length / this.itemsPerPage);
  }
  
  /**
   * Change page
   */
  changePage(page: number): void {
    this.currentPage = page;
  }

  /**
   * Delete All Tracks from an Artist
   * 
   * Initiates the deletion process for all tracks from a specific artist.
   * 
   * Process:
   * 1. Shows confirmation dialog with artist name and track count
   * 2. If confirmed, calls backend to delete tracks
   * 3. Shows loading indicator during deletion
   * 4. On success: shows success message and refreshes data
   * 5. On error: shows error message
   * 
   * The deletion is permanent but creates a backup before removing tracks.
   * 
   * @param artist - The artist whose tracks should be deleted
   */
  deleteArtistTracks(artist: ArtistSummary): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = 'Delete Artist Tracks';
    modalRef.componentInstance.message = `Are you sure you want to delete all ${artist.count} tracks from ${artist.name}?`;
    modalRef.componentInstance.confirmText = 'Delete';
    modalRef.componentInstance.cancelText = 'Cancel';

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadingService.show();
          this.trackService.deleteTracksByArtist(artist.id)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              finalize(() => this.loadingService.hide())
            )
            .subscribe({
              next: () => {
                this.notificationService.success(`Successfully deleted tracks from ${artist.name}`);
                this.loadTrackSummary();
              },
              error: () => {
                this.notificationService.error('Failed to delete tracks');
              },
            });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }
}
