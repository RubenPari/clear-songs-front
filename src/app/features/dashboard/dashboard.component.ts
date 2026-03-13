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
 * for data visualization.
 * 
 * Data Flow:
 * 1. Component loads -> fetch track summary from backend using resource API
 * 2. Backend returns artist summaries with track counts
 * 3. Component calculates statistics and updates chart using Signals
 * 4. User can filter, sort, or delete tracks
 * 5. After deletion, data is refreshed automatically
 * 
 * @component
 * @selector app-dashboard
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ArtistSummary } from '../../core/models/artist.model';
import { TrackService } from '../../core/services/track.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { D3BarChartComponent } from '../../shared/components/d3-bar-chart/d3-bar-chart.component';
import { SkeletonStatComponent, SkeletonTableComponent, SkeletonChartComponent } from '../../shared/components/skeleton/skeleton-components';
import { TrackStore } from '../../core/stores/track.store';
import { ArtistTracksModalComponent } from '../tracks/artist-tracks-modal.component';

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
    SkeletonChartComponent,
    NgbModule,
    TranslateModule
  ]
})
export class DashboardComponent implements OnInit {

  private trackService = inject(TrackService);
  private notificationService = inject(NotificationService);
  public loadingService = inject(LoadingService);
  private modalService = inject(NgbModal);
  private trackStore = inject(TrackStore);
  private translate = inject(TranslateService);

  // Resource holding the data
  private trackSummaryResource = this.trackService.getTrackSummaryResource();

  /**
   * Search filter value
   */
  searchFilter = signal<string>('');

  /**
   * Current page for pagination
   */
  currentPage = signal<number>(1);

  /**
   * Items per page
   */
  itemsPerPage = signal<number>(10);

  /**
   * Sort column
   */
  sortColumn = signal<string>('name');

  /**
   * Sort direction
   */
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Using signals directly from trackStore or resource
  isLoading = computed(() => this.trackSummaryResource.isLoading());
  
  // Create a computed signal for artists from the resource
  artists = computed<ArtistSummary[]>(() => {
    const res = this.trackSummaryResource.value() as any;
    if (!res) return [];
    if (res.data && Array.isArray(res.data)) {
      return res.data as ArtistSummary[];
    } else if (Array.isArray(res)) {
      return res as ArtistSummary[];
    }
    return [];
  });

  totalTracks = computed(() => this.artists().reduce((sum, artist) => sum + artist.count, 0));
  totalArtists = computed(() => this.artists().length);

  /**
   * Chart data for D3.js bar chart
   */
  chartData = computed(() => {
    const data = this.artists();
    const sortedArtists = [...data].sort((a, b) => b.count - a.count).slice(0, 5);
    return sortedArtists.map(artist => ({
      label: artist.name,
      value: artist.count
    }));
  });

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

  filteredArtists = computed(() => {
    let filtered = this.artists();
    const filterValue = this.searchFilter().trim().toLowerCase();
    
    if (filterValue) {
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(filterValue)
      );
    }
    
    const col = this.sortColumn();
    const dir = this.sortDirection();
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (col === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (col === 'count') {
        comparison = a.count - b.count;
      }
      return dir === 'asc' ? comparison : -comparison;
    });
  });

  paginatedArtists = computed(() => {
    const page = this.currentPage();
    const items = this.itemsPerPage();
    const start = (page - 1) * items;
    return this.filteredArtists().slice(start, start + items);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredArtists().length / this.itemsPerPage());
  });

  constructor() {
    // Reset page to 1 when filter changes
    effect(() => {
      this.searchFilter();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
    
    // Toggle loading service state based on resource loading state
    effect(() => {
      if (this.isLoading()) {
        this.loadingService.show();
      } else {
        this.loadingService.hide();
      }
    });

    effect(() => {
      if (this.trackSummaryResource.error()) {
        this.notificationService.error(this.translate.instant('DASHBOARD.LOAD_ERROR'));
      }
    });
  }

  ngOnInit(): void {
    // No specific initialization needed here for now, but required by OnInit
  }

  loadTrackSummary(): void {
    // Reload the resource
    this.trackSummaryResource.reload();
  }

  applyFilter(event?: any): void {
    // Managed automatically by computed signal now, just update the signal if using template events
    if (event && event.target) {
      this.searchFilter.set(event.target.value);
    }
  }

  sortTable(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  changePage(page: number): void {
    this.currentPage.set(page);
  }

  openArtistTracks(artist: ArtistSummary): void {
    const modalRef = this.modalService.open(ArtistTracksModalComponent, {
      size: 'lg',
      centered: true,
      scrollable: true
    });
    modalRef.componentInstance.artist = artist;

    modalRef.result.then((tracksChanged) => {
      if (tracksChanged) {
        this.loadTrackSummary();
      }
    }, () => {});
  }

  deleteArtistTracks(artist: ArtistSummary): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = this.translate.instant('DASHBOARD.DELETE_ARTIST_TITLE');
    modalRef.componentInstance.message = this.translate.instant('DASHBOARD.DELETE_ARTIST_MSG', { count: artist.count, name: artist.name });
    modalRef.componentInstance.confirmText = this.translate.instant('COMMON.DELETE');
    modalRef.componentInstance.cancelText = this.translate.instant('COMMON.CANCEL');

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadingService.show();
          this.trackService.deleteTracksByArtist(artist.id)
            .pipe(
              finalize(() => this.loadingService.hide())
            )
            .subscribe({
              next: () => {
                this.notificationService.success(this.translate.instant('DASHBOARD.DELETE_ARTIST_SUCCESS', { name: artist.name }));
                this.loadTrackSummary();
              },
              error: () => {
                this.notificationService.error(this.translate.instant('DASHBOARD.DELETE_ARTIST_ERROR'));
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
