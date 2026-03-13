import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, forkJoin } from 'rxjs';

import { Track, ArtistSummary } from '../../core/models/artist.model';
import { TrackService } from '../../core/services/track.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface AlbumGroup {
  album: string;
  imageUrl: string;
  tracks: Track[];
}

@Component({
  selector: 'app-artist-tracks-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Tracks by {{ artist.name }}</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      @if (isLoading()) {
        <div class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading tracks...</p>
        </div>
      } @else if (tracks().length === 0) {
        <div class="text-center p-5">
          <i class="bi bi-music-note-beamed" style="font-size: 3rem; color: #cbd5e1;"></i>
          <p class="mt-2 text-muted">No tracks found for this artist.</p>
        </div>
      } @else {
        @for (group of albumGroups(); track group.album) {
          <div class="album-section">
            <div class="album-header" (click)="toggleAlbum(group.album)">
              <div class="album-header-left">
                <i class="bi" [ngClass]="isAlbumCollapsed(group.album) ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
                @if (group.imageUrl) {
                  <img [src]="group.imageUrl" class="album-cover" [alt]="group.album" />
                } @else {
                  <div class="album-cover-placeholder">
                    <i class="bi bi-disc"></i>
                  </div>
                }
                <div class="album-info">
                  <span class="album-name">{{ group.album }}</span>
                  <span class="album-count">{{ group.tracks.length }} {{ group.tracks.length === 1 ? 'track' : 'tracks' }}</span>
                </div>
              </div>
              <button
                class="btn btn-sm btn-outline-danger delete-album-btn"
                (click)="deleteAlbumTracks(group, $event)"
                [disabled]="deletingAlbum() === group.album"
                title="Delete all tracks from this album"
              >
                @if (deletingAlbum() === group.album) {
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                } @else {
                  <i class="bi bi-trash"></i>
                }
                <span class="ms-1">Delete Album</span>
              </button>
            </div>

            @if (!isAlbumCollapsed(group.album)) {
              <div class="album-tracks">
                @for (track of group.tracks; track track.id) {
                  <div class="track-row">
                    <div class="track-name">{{ track.name }}</div>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      (click)="deleteTrack(track)"
                      [disabled]="deletingTrackId() === track.id"
                      title="Delete track"
                    >
                      @if (deletingTrackId() === track.id) {
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      } @else {
                        <i class="bi bi-trash"></i>
                      }
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close(tracksChanged())">Close</button>
    </div>
  `,
  styles: [`
    .modal-body {
      max-height: 60vh;
      overflow-y: auto;
    }

    .album-section {
      margin-bottom: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      overflow: hidden;
    }

    .album-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.04);
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .album-header:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .album-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .album-cover {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .album-cover-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.2rem;
      color: #94a3b8;
    }

    .album-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .album-name {
      font-weight: 600;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .album-count {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .delete-album-btn {
      flex-shrink: 0;
      white-space: nowrap;
    }

    .album-tracks {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .track-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px 8px 70px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.15s ease;
    }
    .track-row:last-child {
      border-bottom: none;
    }
    .track-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .track-name {
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 10px;
    }
  `]
})
export class ArtistTracksModalComponent implements OnInit {
  @Input() artist!: ArtistSummary;

  public activeModal = inject(NgbActiveModal);
  private trackService = inject(TrackService);
  private notificationService = inject(NotificationService);
  private modalService = inject(NgbModal);

  tracks = signal<Track[]>([]);
  isLoading = signal<boolean>(true);
  tracksChanged = signal<boolean>(false);
  deletingTrackId = signal<string | null>(null);
  deletingAlbum = signal<string | null>(null);
  private collapsedAlbums = signal<Set<string>>(new Set());

  albumGroups = computed<AlbumGroup[]>(() => {
    const grouped = new Map<string, Track[]>();
    for (const track of this.tracks()) {
      const albumKey = track.album || 'Unknown Album';
      if (!grouped.has(albumKey)) {
        grouped.set(albumKey, []);
      }
      grouped.get(albumKey)!.push(track);
    }

    return Array.from(grouped.entries()).map(([album, tracks]) => ({
      album,
      imageUrl: tracks[0]?.image_url || '',
      tracks
    }));
  });

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.isLoading.set(true);
    this.trackService.getTracksByArtist(this.artist.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          if (response && response.success && Array.isArray(response.data)) {
            this.tracks.set(response.data);
          } else if (Array.isArray(response)) {
            this.tracks.set(response);
          } else {
            this.tracks.set([]);
          }
        },
        error: () => this.notificationService.error('Failed to load tracks')
      });
  }

  toggleAlbum(albumName: string): void {
    this.collapsedAlbums.update(set => {
      const next = new Set(set);
      if (next.has(albumName)) {
        next.delete(albumName);
      } else {
        next.add(albumName);
      }
      return next;
    });
  }

  isAlbumCollapsed(albumName: string): boolean {
    return this.collapsedAlbums().has(albumName);
  }

  deleteAlbumTracks(group: AlbumGroup, event: Event): void {
    event.stopPropagation();

    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = 'Delete Album Tracks';
    modalRef.componentInstance.message = `Are you sure you want to delete all ${group.tracks.length} tracks from "${group.album}"?`;
    modalRef.componentInstance.confirmText = 'Delete All';
    modalRef.componentInstance.cancelText = 'Cancel';

    modalRef.result.then((result) => {
      if (result) {
        this.deletingAlbum.set(group.album);
        const deleteObs = group.tracks.map(t => this.trackService.deleteTrack(t.id));

        forkJoin(deleteObs)
          .pipe(finalize(() => this.deletingAlbum.set(null)))
          .subscribe({
            next: () => {
              const deletedIds = new Set(group.tracks.map(t => t.id));
              this.tracks.update(t => t.filter(item => !deletedIds.has(item.id)));
              this.tracksChanged.set(true);
              this.notificationService.success(`Deleted ${group.tracks.length} tracks from "${group.album}"`);

              if (this.tracks().length === 0) {
                this.activeModal.close(true);
              }
            },
            error: () => this.notificationService.error('Failed to delete some tracks')
          });
      }
    }, () => {});
  }

  deleteTrack(track: Track): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = 'Delete Track';
    modalRef.componentInstance.message = `Are you sure you want to delete "${track.name}" from your library?`;
    modalRef.componentInstance.confirmText = 'Delete';
    modalRef.componentInstance.cancelText = 'Cancel';

    modalRef.result.then((result) => {
      if (result) {
        this.deletingTrackId.set(track.id);
        this.trackService.deleteTrack(track.id)
          .pipe(finalize(() => this.deletingTrackId.set(null)))
          .subscribe({
            next: () => {
              this.notificationService.success('Track deleted successfully');
              this.tracks.update(t => t.filter(item => item.id !== track.id));
              this.tracksChanged.set(true);

              if (this.tracks().length === 0) {
                this.activeModal.close(true);
              }
            },
            error: () => this.notificationService.error('Failed to delete track')
          });
      }
    }, () => {});
  }
}
