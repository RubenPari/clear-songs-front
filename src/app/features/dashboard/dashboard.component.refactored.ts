/**
 * Dashboard Component (Refactored)
 * 
 * Refactored version using:
 * - TrackStore for state management
 * - RxJS operators for common patterns
 * - Modal helper utilities
 * 
 * @component
 * @selector app-dashboard
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter, switchMap } from 'rxjs/operators';

import { ArtistSummary } from '../../core/models/artist.model';
import { TrackService } from '../../core/services/track.service';
import { TrackStore } from '../../core/stores/track.store';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ArtistTracksModalComponent } from '../../shared/components/artist-tracks-modal/artist-tracks-modal.component';
import { D3BarChartComponent } from '../../shared/components/d3-bar-chart/d3-bar-chart.component';
import { withLoadingAndError } from '../../core/utils/rxjs-operators';
import { openConfirmDialog } from '../../core/utils/modal-helper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    D3BarChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class DashboardComponentRefactored implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private trackService: TrackService,
    private trackStore: TrackStore,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private modalService: NgbModal
  ) {}

  // Use store signals instead of local state
  artists = this.trackStore.artists;
  loading = this.trackStore.loading;
  totalTracks = this.trackStore.totalTracks;
  totalArtists = this.trackStore.totalArtists;
  topArtists = this.trackStore.topArtists;

  // Local UI state (not shared)
  searchFilter = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  sortColumn = signal<'name' | 'count'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Computed filtered and sorted artists
  filteredArtists = computed(() => {
    let filtered = this.artists();
    
    // Apply search filter
    const filterValue = this.searchFilter().trim().toLowerCase();
    if (filterValue) {
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(filterValue)
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (this.sortColumn() === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.count - b.count;
      }
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  });

  // Computed paginated artists
  paginatedArtists = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredArtists().slice(start, end);
  });

  // Computed total pages
  totalPages = computed(() => 
    Math.ceil(this.filteredArtists().length / this.itemsPerPage())
  );

  // Computed chart data from top artists
  chartData = computed(() => 
    this.topArtists().map(artist => ({
      label: artist.name,
      value: artist.count
    }))
  );

  chartColors: string[] = [
    'rgba(99, 102, 241, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)'
  ];

  ngOnInit(): void {
    this.loadTrackSummary();
  }

  /**
   * Load Track Summary Data
   * 
   * Uses the refactored service with caching and store integration.
   * The store is automatically updated when data is received.
   */
  loadTrackSummary(): void {
    this.trackService.getTrackSummary()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        withLoadingAndError(
          this.loadingService,
          this.notificationService,
          'Failed to load track summary'
        )
      )
      .subscribe({
        next: () => {
          // Store is already updated by the service
          // Reset to first page when new data loads
          this.currentPage.set(1);
        }
      });
  }

  /**
   * Apply Filter
   * 
   * Updates the search filter signal, which automatically triggers
   * recomputation of filteredArtists through the computed signal.
   */
  applyFilter(): void {
    // Filter is applied automatically through computed signal
    // Just reset to first page
    this.currentPage.set(1);
  }

  /**
   * Sort Table
   * 
   * Updates sort column and direction signals, which automatically
   * triggers recomputation through the computed signal.
   */
  sortTable(column: 'name' | 'count'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  /**
   * Change Page
   */
  changePage(page: number): void {
    this.currentPage.set(page);
  }

  /**
   * Delete Artist Tracks
   * 
   * Uses the modal helper and RxJS operators for cleaner code.
   */
  deleteArtistTracks(artist: ArtistSummary): void {
    openConfirmDialog(this.modalService, {
      title: 'Delete Artist Tracks',
      message: `Are you sure you want to delete all ${artist.count} tracks from ${artist.name}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(confirmed => confirmed), // Only proceed if confirmed
        switchMap(() => 
          this.trackService.deleteTracksByArtist(artist.id).pipe(
            withLoadingAndError(
              this.loadingService,
              this.notificationService,
              'Failed to delete tracks'
            )
          )
        )
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            `Successfully deleted tracks from ${artist.name}`
          );
          // Reload data (store is already updated, but we want fresh data)
          this.loadTrackSummary();
        }
      });
  }

  /**
   * Open Artist Tracks Modal
   */
  openArtistTracks(artist: ArtistSummary): void {
    const modalRef = this.modalService.open(ArtistTracksModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'artist-tracks-modal'
    });
    
    modalRef.componentInstance.artist = artist;
  }
}
